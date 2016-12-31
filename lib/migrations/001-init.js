import { getConnection } from '@/lib/connectors/mongodb';
import co from 'co';
import assert from 'assert';
import log from '@/lib/log';

export var up = function(next){
  //using a generator function with the co library
  //generated really clean code :D
  co(function* (){
    var db = yield getConnection();
    log.info('creating grp collection');
    var collection = yield db.createCollection("grps", {});
    //create indexes
    yield collection.createIndex({name: "text"});
    yield collection.createIndex({location: "2dsphere"});
    yield collection.createIndex({"address.city": 1});
    yield collection.createIndex({"address.state": 1});
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
    log.info('removing grp collection');
    yield db.dropCollection("grps", {});
    //indexes will be dropped automatically
    next();
  }).catch(
    (error) => {
      log.error(error);
      process.exit(1);
    }
  );
};
