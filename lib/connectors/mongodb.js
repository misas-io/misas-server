import { MongoClient } from 'mongodb';
import { MongoURL } from '@/lib/settings';
import Promise from 'bluebird';
import co from 'co';
import assert from 'assert';
import log from '@/lib/log';


var promise = undefined;

export function getConnection(){
  //log.info(`trying to login to mongo @ ${MongoURL}`);
  if(!promise){
    promise = new Promise((resolve, reject) => {
      log.info(`MongoDB trying to connect at ${MongoURL}`);
      MongoClient.connect(
        MongoURL,
        {
          promiseLibrary: Promise,
        },
        (err, connection) => {
          if(err){
            log.info(`MongoDB error connecting to ${MongoURL}`);
            log.error(err);
            reject(err);
            return;
          }
          log.info(`MongoDB connected at ${MongoURL}`);
          resolve(connection);
          return connection;
        }
      );
    });
  }
  return promise;
};
