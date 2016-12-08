import { unset, set, get, isArray } from 'lodash';
import { GrpSchema, grpValidate, addGrpTimestamps } from '@/api/mongo/grp/model.js';
import assert from 'assert';

describe('GRP schema validation', function(){
  var grp1;
  var initGrp1 = function(){
    grp1 = {
      name: "san pablo del corazon",
      description: "una iglesia muy bonita en ciudad juarez",
      address: {
        address_line_1: "avenida del rosario 324",
        address_line_2: "",
        city: "juarez",
        state: "chihuahua",
        postal_code: "23332",
      },
    };
    addGrpTimestamps(grp1);
  };
  before(function(){
    /*
    getGrpCollection()
      .then((res) => { done(); return res; });
     */
  });
  beforeEach(function(){
    initGrp1();
  });
  afterEach(function(){
    /*if(grpValidate.errors){
      console.log(grpValidate.errors);
    }*/
  });
  it('GRP schema type should be an object', function(){
    assert.equal(GrpSchema.type, "object");
  });
  it('GRP should have a name & it should be a string', function(){
    assert.equal(true, grpValidate(grp1), "valid grp & name should be a string");
    // remove the name
    unset(grp1, 'name'); 
    assert.equal(false, grpValidate(grp1), "invalid grp & name is required");
    // set name to floating numbere 
    set(grp1, 'name', 2.4);
    assert.equal(false, grpValidate(grp1), "invalid grp & name shouldn't be a float");
  });
  describe('GRP address', function(){
    beforeEach(() => {
      initGrp1();
    });
    it('GRP should have an address (even if it invalid) & it should be an object', function(){
      assert.equal(true, grpValidate(grp1), "valid grp: address is set with normal fields");
      // remove the address 
      let address = get(grp1, 'address');
      unset(grp1, 'address');
      assert.equal(false, grpValidate(grp1), "invalid grp: address should be set in grp");
      // add an object (any object)
      set(grp1, 'address', {});
      assert.equal(true, grpValidate(grp1), "valid grp: address is set without fields");
    });
    it('GRP address properties should not be any not in the schema', function(){
      set(grp1, 'address.region', "el paso");
      assert.equal(false, grpValidate(grp1));
      unset(grp1, 'address.region');
      assert.equal(true, grpValidate(grp1));
    });
  });
  describe("GRP schedules", function(){
    beforeEach(function(){
      set(grp1, 'schedules', []);
    });
    it("GRP schedules are an array, but they can also be undefined", function(){
      assert.equal(true, isArray(grp1.schedules), "grp schedule is an array");
      assert.equal(true, grpValidate(grp1), "grp schedule as an array is valid");
      unset(grp1, 'schedules');
      assert.equal(true, grpValidate(grp1), "grp schedule as undefined is also valid");
    });
    describe("GRP schedule", function(){
      function addScheduleWithDuration(grp, seconds){
        grp.schedules.push({
          duration: seconds,
          recurrences: []
        });
      };
      function addScheduleWithDurationAndRecurrences(grp, seconds, recurrences){
        grp.schedules.push({
          duration: seconds,
          recurrences: recurrences
        });
      };
      afterEach(function(){
        //console.log(grpValidate.errors);
      });
      describe("GRP schedule's duration", function(){
        it("GRP schedule's duration should be an int (preferably representing seconds)", function(){
          addScheduleWithDuration(grp1, 60);
          assert.equal(true, grpValidate(grp1), "grp is valid & duration is an integer which is valid");
          addScheduleWithDuration(grp1, "sixty");
          assert.equal(false, grpValidate(grp1), "grp is not valid & duration is a string which is not valid");
        });
      });
      describe("GRP schedule's recurrences", function(){
      }); 
    });
  });
});
