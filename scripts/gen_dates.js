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
  .parse(process.argv);

if(!program.file){
  log.error('JSON file argument is required');
  program.help();
}

