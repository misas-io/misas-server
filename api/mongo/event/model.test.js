import moment from 'moment';
import { cloneDeep } from 'lodash';
import assert from 'assert';
import log from '@/log';
import { eventValidate, getEventsFromUntil } from '@/api/mongo/event/model';
import { Event1 } from '@/api/mongo/event/mocks';
import { Grp1, Schedule1 } from '@/api/mongo/grp/mocks';


var equalValidationCheck = (expectedValue, value, validator) => {
  try {
    assert.equal(expectedValue, validator(value));
  } catch (error) {
    console.log(validator.errors);
    throw error;
  }
};

describe('Events', function(){
  var event1;
  var initEvent = function(){
    event1 = cloneDeep(Event1); 
  };
  beforeEach(function(){
    initEvent();
  });
  describe('Events Schema validation', function(){
    it('Events should have a name', function(){
      equalValidationCheck(true, event1, eventValidate);
    });
    it('Events could have a location', function(){
      equalValidationCheck(true, event1, eventValidate);
    });
    it('Events have a date', function(){
      equalValidationCheck(true, event1, eventValidate);
    });
    it('Events have a type', function(){
      equalValidationCheck(true, event1, eventValidate);
    });
  });
  describe('Events Generation', function(){
    var grp1;
    var startDate1 = moment("20161201", "YYYYMMDD").startOf("month").utcOffset(0, true).toDate();
    var endDate1 = moment("20170130", "YYYYMMDD").endOf('month').utcOffset(0, true).toDate();
    beforeEach(function(){
      grp1 = cloneDeep(Grp1);    
      grp1.schedules = cloneDeep(Schedule1);
      grp1.location = cloneDeep(Event1.location);
    });
    it('should generate 452 events from 12/01/2016 to 01/30/2017', function(){
      var events = getEventsFromUntil(grp1, startDate1, endDate1);
      assert.equal(452, events.length, 'There should be 452 events from 12/01/2016 to 01/30/2017');
      //console.log(events);
    });
  });
});
