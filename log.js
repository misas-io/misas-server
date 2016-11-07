import winston from 'winston';

const logger = new (winston.Logger)({
  exitOnError: true,
  transports: [
    new (winston.transports.Console)({
      handleExceptions: true,
      colorize: 'level',
      prettyPrint: true,
      depth: 4
    })
  ]
});

export default logger;
