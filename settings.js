import toml from 'toml';
import fs from 'fs';
import log from './log';
import _ from 'lodash';

var settings = {};

if(_.isEqual(settings, {}))
{
  try
  {
    const conf = fs.readFileSync("misas.toml", { encoding: 'utf8'});
    settings = toml.parse(conf);
    log.info('configuration loaded from TOML %s\n', "misas.toml", settings);
  }
  catch(e)
  {
    log.error('Error reading misas TOML %s configuration\n', "misas.toml", e);
  }
}

export const Mongo = settings.database.mongo;
export const MongoURL = `mongodb://${Mongo.host}:${Mongo.port}/${Mongo.name}`;
export default settings;
