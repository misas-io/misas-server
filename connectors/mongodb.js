import { MongoClient } from 'mongodb';
import { MongoURL } from '@/settings';
import assert from 'assert';
import log from '@/log';


// connection is of type promise

export function getConnection(){
  //log.info(`trying to login to mongo @ ${MongoURL}`);
  return MongoClient.connect(MongoURL)
  .then(
    (res) => {
      log.info(`MongoDB connected at ${MongoURL}`);
      return res;
    }
  )
  .catch(
    (err) => {
      log.error(err);
    }
  );
};
