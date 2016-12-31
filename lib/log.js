import winston from 'winston';
import util from 'util';

/* TODO: setup uncaught exceptions handler */
/* TODO: on  */
/* setup the default logger which just prints to stdout */
var logger = new (winston.Logger)({
  exitOnError: true,
  transports: [
    new (winston.transports.Console)(
      { level: 'info', colorize: 'level'}
    )
  ], 
});

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
}

export function createJobLogger(settings){
  let transports = [];
  if (process.env.NODE_ENV == 'development') {
    transports.push(new (winston.transports.Console)({ level: 'info', colorize: 'level'}));
    if (settings.logs.file) {
      transports.push(new (winston.transports.File)({ level: 'silly', filename: settings.logs.filepath }));
    }
  } else if (process.env.NODE_ENV == 'production') {
    transports.push(new (winston.transports.Console)({ level: 'info', colorize: 'level'}));
    if (settings.logs.file) {
      transports.push(new (winston.transports.File)({ level: 'verbose', filename: settings.logs.filepath }));
    }
  } 

  let jobLogger = new (winston.Logger)({
    transports: transports, 
  });

  jobLogger.silly('test'); 
  jobLogger.debug('test'); 
  jobLogger.verbose('test'); 
  jobLogger.info('test'); 
  jobLogger.warn('test'); 
  jobLogger.error('test'); 
  return jobLogger;
}

//console.log(util.inspect(logger, { depth: 4, colors: true }));
export function getLogger(){
  return logger;
};

export default logger;
