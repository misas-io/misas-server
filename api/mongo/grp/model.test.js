import util from 'util';
import later from 'later';
import assert from 'assert';
import moment from 'moment';
import { unset, set, get, isArray, pick, map, cloneDeep } from 'lodash';
import { GrpSchema, grpValidate, addGrpTimestamps, getGrpCollection, getNextGrpDatesFromUntil } from '@/api/mongo/grp/model.js';
import { Grp1, Schedule1 } from '@/api/mongo/grp/mocks';

describe('GRP schema validation', function(){
  var grp1, sched1;
  const initGrp1 = function(){
    grp1 = cloneDeep(Grp1);    
    addGrpTimestamps(grp1);
    //schedule for tests
    sched1 = cloneDeep(Schedule1);  
  };
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
          let valid = grpValidate(grp1);
          assert.equal(true, valid, "grp is valid & duration is an integer which is valid");
          addScheduleWithDuration(grp1, "sixty");
          assert.equal(false, grpValidate(grp1), "grp is not valid & duration is a string which is not valid");
        });
      });
      /*describe("GRP schedule's recurrences", function(){
      }); */
      describe("GRP schedule's validation", function(){
        it("GRP schedule with minutes, hours, and days of the week", function(){
          grp1.schedules = sched1;
          assert.equal(true, grpValidate(grp1), "grp is valid & duration is an integer which is valid");
        });
        //TODO try other complicated schedules
      });
      describe("GRP schedule's dates generation", function(){
        it("GRP sched1 should generate 225 dates for the month of 2016/12", function(){
          let startDate = moment("201612", "YYYYMM").startOf("month").utcOffset(0, true).toDate();
          let endDate = moment("201612", "YYYYMM").endOf('month').utcOffset(0, true).toDate();
          grp1.schedules = sched1;
          let dates = getNextGrpDatesFromUntil(grp1, -1, startDate, endDate);
          assert.equal(225, dates.length, "grp is valid & duration is an integer which is valid");
        });
        //TODO try other complicated schedules
      });
    });
  });
});
