import { getConnection } from '@/connectors/mongodb';
import co from 'co';
import assert from 'assert';
import log from '@/log';

export var up = function(next){
  //using a generator function with the co library
  //generated really clean code :D
  co(function* (){
    var db = yield getConnection();
    log.info('adding collation support to event indexes');
    //change events indexes
    var collection = db.collection("events", {});
    //remove indexes
    yield collection.dropIndex({country: 1});
    yield collection.dropIndex({city: 1});
    yield collection.dropIndex({state: 1});
    //add indexes
    yield collection.createIndex(
      {country: 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    yield collection.createIndex(
      {city: 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    yield collection.createIndex(
      {state: 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    log.info('adding collation support to grps indexes');
    //change indexes for grps
    collection = db.collection("grps", {});
    //remove indexes
    yield collection.dropIndex({"address.city": 1});
    yield collection.dropIndex({"address.state": 1});
    //add indexes
    yield collection.createIndex(
      {"address.country": 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    yield collection.createIndex(
      {"address.city": 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    yield collection.createIndex(
      {"address.state": 1}, 
      { 
        collation: {
          locale: "es",
          strength: 2,
        }
      }
    );
    next();
  }).catch(
    (error) => {
      log.error(error);
      process.exit(1);
    }
  );
};

export var down = function(next){
  co(function* (){
    var db = yield getConnection();
    log.info('removing collation support to events indexes');
    //change events indexes back
    var collection = db.collection("events", {});
    //remove indexes
    yield collection.dropIndex({country: 1});
    yield collection.dropIndex({city: 1});
    yield collection.dropIndex({state: 1});
    //add old indexes
    yield collection.createIndex({country: 1});
    yield collection.createIndex({city: 1});
    yield collection.createIndex({state: 1});
    log.info('removing collation support to grps indexes');
    //change grps indexes back
    collection = db.collection("grps", {});
    //remove indexes
    yield collection.dropIndex({"address.country": 1});
    yield collection.dropIndex({"address.city": 1});
    yield collection.dropIndex({"address.state": 1});
    //add old indexes
    yield collection.createIndex({"address.city": 1});
    yield collection.createIndex({"address.state": 1});
    next();
  }).catch(
    (error) => {
      log.error(error);
      process.exit(1);
    }
  );
}
