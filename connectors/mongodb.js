import { MongoClient } from 'mongodb';
import { MongoURL } from './../settings';
import assert from 'assert';


// connection is of type promise
export const Connection = MongoClient.connect(MongoURL).catch(
  (err) => {
    assert.equal(null, err);
  }
);
