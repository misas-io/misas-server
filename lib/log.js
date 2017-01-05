import winston from 'winston';
import util from 'util';
import { isString } from 'lodash';

/* TODO: setup uncaught exceptions handler */
/* setup the default logger which just prints to stdout */
var logger = new (winston.Logger)({
  exitOnError: true,
  transports: [
    new (winston.transports.Console)(
      { level: 'info', colorize: 'level'}
    )
  ], 
});

var loggers = {};

export function setupLogger(settings){
  let transports = [];
  if (process.env.NODE_ENV == 'development') {
    transports.push(new (winston.transports.Console)({ level: 'verbose', colorize: 'level'}));
    if (settings.logs.file) {
      transports.push(new (winston.transports.File)({ level: 'silly', filename: settings.logs.filepath }));
    }
  } else if (process.env.NODE_ENV == 'production') {
    transports.push(new (winston.transports.Console)({ level: 'info', colorize: 'level'}));
    if (settings.logs.file) {
      transports.push(new (winston.transports.File)({ level: 'verbose', filename: settings.logs.filepath }));
    }
  } else {
    return;
  }

  logger = new (winston.Logger)({
    exitOnError: true,
    transports: transports, 
  });

  logger.silly('test'); 
  logger.debug('test'); 
  logger.verbose('test'); 
  logger.info('test'); 
  logger.warn('test'); 
  logger.error('test'); 
  return logger;
}

export function createLogger(settings){
  settings = settings || {};
  let transports = [];
  if (settings.terminal) {
    transports.push(new (winston.transports.Console)({ level: settings.terminal_level ? settings.terminal_level : 'info', colorize: 'level'}));
  }
  if (settings.file) {
    if (process.env.NODE_ENV == 'development') {
      transports.push(new (winston.transports.File)({ level: 'silly', filename: settings.filepath }));
    } else if (process.env.NODE_ENV == 'production') {
      transports.push(new (winston.transports.File)({ level: 'verbose', filename: settings.filepath }));
    } 
  }

  let jobLogger = new (winston.Logger)({
    transports: transports, 
  });

  if (isString(settings.name)) {
    set(loggers,name,jobLogger);
  }

  if (settings.show_tests) {
    jobLogger.silly('test'); 
    jobLogger.debug('test'); 
    jobLogger.verbose('test'); 
    jobLogger.info('test'); 
    jobLogger.warn('test'); 
    jobLogger.error('test'); 
  }
  return jobLogger;
}

export function getLogger(name){
  if (!isString(name)) {
    return logger;
  }
  return get(loggers,name);
};

export default logger;
