import { unset, set, get, isArray, pick, map } from 'lodash';
import { GrpSchema, grpValidate, addGrpTimestamps, getGrpCollection, getNextGrpDatesFromUntil } from '@/api/mongo/grp/model.js';
import util from 'util';
import later from 'later';
import assert from 'assert';
import moment from 'moment';

describe('GRP schema validation', function(){
  var grp1, sched1;
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
    //schedule for tests
    sched1 = [ 
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 10 ], m: [ 0 ] } ] },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 13 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 18 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 1 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 2 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 3 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 4 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 5 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 6 ], h: [ 20 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 7 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 8 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 9 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 10 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 11 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa Diaria',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 24 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 19 ], m: [ 0 ] } ] 
      },
      { 
        name: 'Misa de Precepto Dominical',
        duration: 60,
        recurrences: [ { d: [ 7 ], h: [ 20 ], m: [ 0 ] } ] 
      } 
    ];
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
      /*async function grpSchedule(done){
        let grps = await getGrpCollection();  
        let grp = await grps.findOne({});
        console.log(util.inspect(grp.schedules, {showHidden: false, depth: null}))
        let startDate = moment("201612", "YYYYMM").startOf("month").toDate();
        let endDate = moment("201612", "YYYYMM").endOf('month').toDate();
        console.log(startDate);
        console.log(endDate);
        console.log(getNextGrpDatesFromUntil(grp, -1, startDate, endDate));
        done();
      };*/
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
