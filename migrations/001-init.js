import { Connection } from './../connectors/mongodb';
import assert from 'assert';

export var up = function(next){
  Connection.then(
    (db) => {
      db.createCollection("parroquia", {}, (err, collection) => {
        assert.equal(null, err);
        next();
      })
    }
  )
};

export var down = function(next){
  Connection.then(
    (db) => {
      db.dropCollection("parroquia", {}, (err, collection) => {
        assert.equal(null, err);
        next();
      })
    }
  )
};
