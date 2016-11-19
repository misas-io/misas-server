import Promise from 'bluebird';
import { get } from 'lodash';
import { Grp } from '@/api/mongo/grp/model';
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
    let newGrp = {
      name: get(grp, 'name', 'Unknown'),
      type: {
        name: get(grp, 'parroquia_type', 'Parroquia'),
        //religion: 'Catolica',
      },
      group: {
        name: get(grp, 'diocesis_name', null),
      },
      location: {
        address: {
          address_line_1: get(grp, 'address_line_1', ''),
          address_line_2: get(grp, 'address_line_2', null),
          address_line_3: get(grp, 'address_line_3', null),
          country: 'mexico',
          phone: get(grp, 'phone', null),
          state: get(grp, 'state.name', null),
          city: get(grp, 'city.name', null),
          postal_code: get(grp, 'postal_code', null),
        },
        lat: get(grp, 'location.lat', null),
        lon: get(grp, 'location.lon', null),
      },
      href: get(grp, 'href', ''),
    };
    let preGrp = new Grp(newGrp);
    preGrp.save((err, doc) => {
      if(err)
        console.log(err);
      numUploaded++;
      load.text = `loaded ${numUploaded}/${numTotal}`;
      callback();
    });
  }, (err) => {
    if(err){
      log.error(err);
    }
    load.text = "";
    load.stop();
    log.info("Successfully uploaded all grps");
    process.exit();
  });
})
