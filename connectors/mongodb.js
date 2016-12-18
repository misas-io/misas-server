import { MongoClient } from 'mongodb';
import { MongoURL } from '@/settings';
import Promise from 'bluebird';
import co from 'co';
import assert from 'assert';
import log from '@/log';


var promise = undefined;

export function getConnection(){
  //log.info(`trying to login to mongo @ ${MongoURL}`);
  if(!promise){
    promise = new Promise((resolve, reject) => {
      MongoClient.connect(MongoURL)
      .then(
        (connection) => {
          log.info(`MongoDB connected at ${MongoURL}`);
          resolve(connection);
          return connection;
        }
      )
      .catch(
        (err) => {
          reject(error);
          log.error(err);
        }
      );
    });
  }
  return promise;
};
