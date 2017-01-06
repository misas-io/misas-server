import Promise from 'bluebird';
import later from 'later';
import util from 'util';
import moment from 'moment';
import { get, set, map, isInteger, isFunction, toInteger, toNumber, flattenDeep } from 'lodash';
import { getGrpCollection } from '@/lib/api/mongo/grp/model';
import { getEventCollection, getEventsFromUntil } from '@/lib/api/mongo/event/model';
import fs from 'fs';
import eachLimit from 'async/eachLimit';
import queue from 'async/queue';
import {getLogger, createLogger} from '@/lib/log';
import ora from 'ora';
import spinners from 'cli-spinners';
import co from 'co';
import { fileSeqInit, fileSeqNext } from 'file-sequence-generator';

var JOB_LOG_FILE = 'logs/generate-events.json';
var JOB_NAME = 'generate-events';

export default function(agenda) {
  agenda.define(JOB_NAME, function(job, done) {
    // use job.attrs.data.* to get properties specific to this job
    /* start the job for processing GRPs and generating the events
       for a job */
    run({
      from: job.attrs.data.from,
      until: job.attrs.data.until,
      runtime: 'background',
      callback: done,
      job: job,
    });
  });
  agenda.on('ready', () => {
    fileSeqInit(JOB_LOG_FILE);
    if (moment().date() <= 15) {
      agenda.now(JOB_NAME, {
        from: moment().startOf("month").toDate(),
        until: moment().date(15).endOf('day').toDate()
      });
    } else {
      agenda.now(JOB_NAME, {
        from: moment().date(16).startOf('day').toDate(),
        until: moment().endOf("month").toDate()
      });
    }
    agenda.now(JOB_NAME, {});
    agenda.every('0 1 1,16 * *', 'generateGRPsEvents');
    //agenda.every('*/2 * * * *', JOB_NAME, {}, { timezone: 'America/Denver' });
  });
};

function runJob({callback}){
  var log = createLogger({
    file: true,
    filepath: fileSeqNext(JOB_LOG_FILE),
    terminal: true,
  });
  log.info(`starting ${JOB_NAME}`);
  callback();
};

export function run(parms){

  let log; 
  let load; 
  let from;
  let until;
  parms = parms || {};
  switch(get(parms,'runtime','')) {
    case 'terminal':
      log = getLogger();
      load = ora({
        text: 'reading GRPs',
        spinner: spinners.dots12
      });
      break;
    case 'background':
    default:
      if (!parms.callback) {
        throw new Error(`${JOB_NAME} requires a callback to be defined`);
      }
      log = createLogger({
        file: true,
        filepath: fileSeqNext(JOB_LOG_FILE),
        terminal: true,
      });
      set(parms,'runtime','background');
  }

  if (parms.from) {
    from = parms.from;
  } else {
    if (moment().date() <= 15) {
      from = moment().date(16).startOf('day').toDate();
    } else {
      from = moment().add(1, 'month').startOf("month").toDate();
    }
  }
  if (parms.until) {
    until = parms.until;
  } else {
    if (moment().date() <= 15) {
      until = moment().endOf("month").toDate();
    } else {
      until = moment().add(1, 'month').date(15).endOf('day').toDate();
    }
  }
  
  let { runtime } = parms;
  //setup multi processing
  let count = 0;
  let eventsCount = 0;
  let finished = false;
  /* functions for processing runtimes a bit differently */
  let outputInfo = function(text) {
    if (parms.runtime == 'terminal') {
      load.text = text;
    } else {
      log.info(text);
    }
  };
  let exitOnError = function(err) {
    log.warn(`error ${JOB_NAME} ${moment().toDate()}`);
    log.error(err);
    if (parms.runtime == 'terminal') {
      process.exit(1);
    } else {
      throw new Error(err);
    }
  };
  let exitOnSuccess = function() {
    if (parms.runtime == 'terminal') {
      process.exit();
    } else {
      parms.callback();
    }
  };

  let q = queue((eventsTask, callback) => {
    getEventCollection().then((events) => {
      let eventsI = eventsTask.events;
      if (eventsI.length != 0) {
        events.insertMany(eventsI, (error, result) => {
          if (error) {
            exitOnError(error);
          }
          eventsCount += eventsI.length;
          if (eventsCount % 20000 < (eventsCount - eventsI.length ) % 20000) {
            outputInfo(`read GRPs / inserted Events [ ${count} / ${eventsCount} ] `);
          }
          callback();
        });
      } else {
        callback();
      }
    });
  }, 10);

  q.drain = () => {
    if (finished) {
      outputInfo('');
      if (parms.runtime == 'terminal')
        load.stop();
      log.info(`inserted ${eventsCount} Events`);
      log.info(`ending ${JOB_NAME} ${moment().toDate()}`);
      exitOnSuccess();
    }
  };

  if (parms.runtime == 'terminal')
    load.start();

  outputInfo(`starting ${JOB_NAME} ${moment().toDate()}`);

  co(function* (){
    log.info(`getting Events collection`);
    var events = yield getEventCollection();
    log.info(`getting GRP collection`);
    var grps = yield getGrpCollection();
    // calculate start and end dates
    //
    // remove all old events 
    var current = moment();
    var removeOption = { wtimeout: 2 * 60 * 1000 };
    var removed;
    if (current.isBetween(from, until)) {
      removed = yield events.remove({ date: { $gte: current.toDate(),  $lte: until}}, removeOption);
      from = current.toDate();
    } else {
      removed = yield events.remove({date: { $gte: from,  $lte: until}}, removeOption);
    }
    log.info(`removed ${removed.result.n} events with dates less than ${current.toDate()}`);
    log.info(`generating events from ${from} until ${until}`);
    grps.find({}).forEach(
      (grp) => {
        count += 1;
        // generate new events for the given start end dates
        let events = getEventsFromUntil(grp, from, until);
        q.push({events: events});
        if(count % 1000 == 0) {
          outputInfo(`read GRPs / inserted Events [ ${count} / ${eventsCount} ] `);
        }
      },
      () => {
        finished = true;
      }
    );
  }).catch((err) => {
    exitOnError(err);
  });
};
