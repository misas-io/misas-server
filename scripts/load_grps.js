import Promise from 'bluebird';
import later from 'later';
import { get, set, map, isInteger, toInteger, toNumber, flattenDeep } from 'lodash';
import { createGrp } from '@/api/mongo/grp/model';
import fs from 'fs';
import eachLimit from 'async/eachLimit';
import log from '@/log';
import ora from 'ora';
import spinners from 'cli-spinners';
import program from 'commander';

program
  .version('1.0.0')
  .option('-f, --file [JSON file]', 'JSON file containing all GRPs')
  .parse(process.argv);

if(!program.file){
  log.error('JSON file argument is required');
  program.help();
}

fs.readFile(program.file, { encoding: 'utf8'}, (err, data) => {
  if(err) {
    log.error('Unable to read JSON file, file not found');
    throw err;
  }

  let load = ora({
    text: 'loading json file',
    spinner: spinners.dots12
  });
  let parroquias = JSON.parse(data.toString('uft8'));
  let numTotal = parroquias.length;
  let numUploaded = 0;

  load.start();
  eachLimit(parroquias, 40, (grp, callback) => {
    //setup location
    let lat = get(grp, 'location.lat', null);
    let lon = get(grp, 'location.lon', null);
    let location = {
    };
    if(lat != null && lon != null){
      location = {
        location: {
          type: "Point",
          coordinates: [toNumber(lon), toNumber(lat)],
        },
      };
      //log.info(location);
    } else {
      //set(location, 'location.type', undefined);
      //set(location, 'location.coordinates', undefined);
      //log.info({});
    }
    //setup events 
    let days = get(grp, 'schedule.days');
    let schedules;
    if(days){
      schedules = map(days, (day) => {
        let dw = get(day, 'id');
        if(!isInteger(dw)){
          log.error("schedule.days.id is not a number");
        }
        dw = dw == 7 ? 1 : dw + 1;  
        let events = get(day, 'events');
        let newEvents = map(events, (event) => {
          let hour = toInteger(get(event, 'start_time.hour'));
          let mins = toInteger(get(event, 'start_time.mins'));
          let isPM = get(event, 'start_time.meridiem') == "PM";
          hour = isPM ? hour + 12 : hour;
          let recurrences = later
            .parse.recur()
            .on(dw).dayOfWeek()
            .on(hour).hour()
            .on(mins).minute().schedules;
          return {
            name: get(event, 'type', ''),
            duration: 60,
            recurrences: recurrences,
          }
        });
        return [ newEvents ];
      });
      schedules = flattenDeep(schedules);
    } else {
      schedules = [];
    }
    let newGrp = {
      name: get(grp, 'name', 'Unknown'),
      description: "",
      type: {
        name: get(grp, 'parroquia_type', 'Parroquia'),
        //religion: 'Catolica',
      },
      group: {
        name: get(grp, 'diocesis_name', null),
      },
      address: {
        address_line_1: get(grp, 'address_line_1', ''),
        address_line_2: get(grp, 'address_line_2', undefined),
        address_line_3: get(grp, 'address_line_3', undefined),
        country: 'mexico',
        phone: get(grp, 'phone', undefined),
        state: get(grp, 'state.name', undefined),
        city: get(grp, 'city.name', undefined),
        postal_code: get(grp, 'postal_code', undefined),
      },
      ...location,
      schedules: schedules,
      href: get(grp, 'href', ''),
    };
    createGrp(newGrp).then((doc) => {
      if(numUploaded % 100 == 0){
        load.text = `loaded ${numUploaded}/${numTotal}`;
      }
      numUploaded++;
      callback();
    }).catch((err) => {
      callback(err);
    });
  }, (err) => {
    if(err){
      log.error(err);
      process.exit(-1);
    }
    load.text = "";
    load.stop();
    log.info("Successfully uploaded all grps");
    process.exit();
  });
})
