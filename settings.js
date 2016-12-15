import toml from 'toml';
import fs from 'fs';
import log from './log';
import _ from 'lodash';

var impSettings = {};
var misasConfPath = process.env.MISAS_CONF || "misas.toml";

if(_.isEqual(impSettings, {}))
{
  try
  {
    const conf = fs.readFileSync(misasConfPath, { encoding: 'utf8'});
    impSettings = toml.parse(conf);
    log.info('configuration loaded from TOML %s\n', misasConfPath, impSettings);
  }
  catch(e)
  {
    log.error('Error reading misas TOML %s configuration\n', misasConfPath, e);
  }
}

// Evaluate the input from toml parse and set defaults if needed
var expSettings = impSettings;

// Server defaults
expSettings.server.host = impSettings.server.host || '0.0.0.0';
expSettings.server.port = impSettings.server.port || 8084;
expSettings.server.port = impSettings.server.subscription_port || 8085;

// Database defaults
expSettings.database.mongo.host = impSettings.database.mongo.host || '0.0.0.0';
expSettings.database.mongo.port = impSettings.database.mongo.port || 27017;
expSettings.database.mongo.name = impSettings.database.mongo.name || 'misas';

// Log defaults
if (impSettings.logs.stdout === null)
{
  expSettings.logs.stdout = true;
}
else
{
  expSettings.logs.stdout = impSettings.logs.stdout;
}
if (impSettings.logs.file === null)
{
  expSettings.logs.file = true;
}
else
{
  expSettings.logs.file = impSettings.logs.file;
}
expSettings.logs.filepath = impSettings.logs.filepath || "misas.log";

const settings = expSettings;

export const Mongo = settings.database.mongo;
export const MongoURL = process.env.MONGO_URL || `mongodb://${Mongo.host}:${Mongo.port}/${Mongo.name}`;
export default settings;
