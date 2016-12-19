import Promise from 'bluebird';
import later from 'later';
import util from 'util';
import moment from 'moment';
import { get, set, map, isInteger, toInteger, toNumber, flattenDeep } from 'lodash';
import { getGrpCollection } from '@/api/mongo/grp/model';
import { getEventCollection, getEventsFromUntil } from '@/api/mongo/event/model';
import fs from 'fs';
import eachLimit from 'async/eachLimit';
import queue from 'async/queue';
import log from '@/log';
import ora from 'ora';
import spinners from 'cli-spinners';
import program from 'commander';
import co from 'co';


program
  .version('1.0.0')
  .parse(process.argv);

//setup multi processing
var count = 0;
var eventsCount = 0;
var finished = false;
var q = queue((eventsTask, callback) => {
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
