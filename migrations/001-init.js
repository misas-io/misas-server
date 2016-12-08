import { getConnection } from '@/connectors/mongodb';
import co from 'co';
import assert from 'assert';
import log from '@/log';

export var up = function(next){
  //using a generator function with the co library
  //generated really clean code :D
  (async function(){
    var db = await getConnection();
    var collection = await db.createCollection("grps", {});
    //create indexes
    await collection.createIndex({name: "text"});
    await collection.createIndex({location: "2dsphere"});
    await collection.createIndex({"address.city": 1});
    await collection.createIndex({"address.state": 1});
    next();
  })().catch(
    (error) => {
      log.error(error);
    }
  );
};

export var down = function(next){
  (async function(){
    var db = await getConnection();
    await db.dropCollection("grps", {});
    //indexes will be dropped automatically
    next();
  })().catch(
    (error) => {
      log.error(error);
    }
  );
};
