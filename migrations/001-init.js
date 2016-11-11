import { Connection } from '@/connectors/mongodb';
import assert from 'assert';

export var up = function(next){
  Connection.then(
    (db) => {
      db.createCollection("grp", {}, (err, collection) => {
        assert.equal(null, err);
        next();
      })
    }
  )
};

export var down = function(next){
  Connection.then(
    (db) => {
      db.dropCollection("grp", {}, (err, collection) => {
        assert.equal(null, err);
        next();
      })
    }
  )
};
