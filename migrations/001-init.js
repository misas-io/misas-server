import { Connection } from '@/connectors/mongodb';
import co from 'co';
import assert from 'assert';

export var up = function(next){
  //using a generator function with the co library
  //generated really clean code :D
  co(function *(){
    let db = yield Connection;
    let collection = yield db.createCollection("grps", {});
    //create index
    yield collection.createIndex({name: "text"});
    next();
  }).catch(
    (error) => {
      assert.equal(null, error);
    }
  );
};

export var down = function(next){
  co(function *(){
    let db = yield Connection;
    yield db.dropCollection("grps", {});
    //indexes will be dropped automatically
    next();
  }).catch(
    (error) => {
      assert.equal(null, error);
    }
  );
};
