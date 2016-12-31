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
import { createJobLogger } from '@/lib/log';
import ora from 'ora';
import spinners from 'cli-spinners';
import co from 'co';


export default function(agenda) {
  agenda.define('generateGRPsEvents', function(job, done) {
    // use job.attrs.data.* to get properties specific to this job
    /* start the job for processing GRPs and generating the events
       for a job */
    run({
      runtime: 'background',
      callback: done,
      job: job,
    });
  });
  agenda.on('ready', () => {
    //agenda.every('0 0 1 * *', 'generateGRPsEvents');
    agenda.every('1 * * * *', 'generateGRPsEvents');
  });
};



export function run(parms){

  var log = createJobLogger({
    file: true,
    filepath: 'logs/generate-events.log',
  });

  parms = parms || {};
  switch(get(parms,'runtime','')) {
    case 'terminal':
      break;
    case 'background':
      break;
    default:
      set(parms,'runtime','background');
  }
  
  let { runtime } = parms;
  //setup multi processing
  let count = 0;
  let eventsCount = 0;
  let finished = false;
  let q = queue((eventsTask, callback) => {
    getEventCollection().then((events) => {
      let eventsI = eventsTask.events;
      if (eventsI.length != 0) {
        events.insertMany(eventsI, (error, result) => {
          if (error) {
            log.warn(util.inspect(eventsI, {depth: 3, colors: true}));
            process.exit(1);
          }
          eventsCount += eventsI.length;
          if (eventsCount % 20000 < (eventsCount - eventsI.length ) % 20000) {
            load.text = `read GRPs / inserted Events [ ${count} / ${eventsCount} ] `;
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
      load.text = '';
      load.stop();
      console.log(`inserted ${eventsCount} Events`);
      process.exit();
    }
  };

  let load = ora({
    text: 'reading GRPs',
    spinner: spinners.dots12
  });

  

  co(function* (){
    log.info(`getting Events collection`);
    var events = yield getEventCollection();
    log.info(`getting GRP collection`);
    var grps = yield getGrpCollection();
    // calculate start and end dates
    let from = moment().startOf("month").utcOffset(0, true).toDate();
    let until = moment().add(1, 'month').endOf("month").utcOffset(0, true).toDate();
    log.info(`generating events from ${from} until ${until}`);
    load.start();
    // remove all old events 
    yield events.remove({});
    grps.find({}).forEach(
      (grp) => {
        count += 1;
        // generate new events for the given start end dates
        let events = getEventsFromUntil(grp, from, until);
        q.push({events: events});
        if(count % 1000 == 0) {
          load.text = `read GRPs / inserted Events [ ${count} / ${eventsCount} ] `;
        }
      },
      () => {
        finished = true;
      }
    );
  }).catch((err) => {
    log.error(err);
    process.exit(1);
  });
};
