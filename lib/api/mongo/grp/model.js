import { pick, map, size } from 'lodash';
import co from 'co';
import later from 'later';
import Promise from 'bluebird';
import Ajv from 'ajv';
import moment from 'moment';
import { toGlobalId } from '@/lib/misc/global_id';
import { getConnection } from '@/lib/connectors/mongodb';
import log from '@/lib/log';

/**
 * This module defines the main methods to create, validate, get different
 * information related to a GRP, etc. Most if not all DB operations for GRPs
 * should go thru method defined here.
 * @module api/mongo/grp/model
 */
later.date.localTime();

const ajv = new Ajv();

export const GrpSchema = {
  type: "object",
  required: [
    "name",
    "description",
    "address",
    "updated",
    "created"
  ],
  properties: {
    _id: {
      oneOf: [
        { type: "string" },
        { type: "object" },
      ],
    },
    type: { 
      type: "object",
      properties: {
        name: { type: "string" },
        religion: { type: "string" }, 
      }
    },
    group: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string" },
      },
    },
    name:  { type: "string" },
    description: { type: "string" },
    address: {
      additionalProperties: false,
      properties: {
        address_line_1: { type: "string" },
        address_line_2: { type: "string" },
        address_line_3: { type: "string" },
        phone: { type: "string" },
        country: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        postal_code: { type: "string" },
      },
    },
    location: {
      additionalProperties: false,
      properties: {
        type: { 
          type: "string",
        },
        // lat is the first coordinate
        // lon is the second coordinate
        coordinates: { 
          type: "array",
          items: {
            type: "number",
          },
        },
      }
    },
    schedules: {
      type: "array", 
      items: {
        type: "object",
        required: [
          "duration",
          "recurrences"
        ],
        properties: {
          name: { type: "string" },
          duration: { type: "integer" },
          recurrences: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                // SECOND schedule types
                s: { type: "array", items: { type: "integer",}, },
                s_a: { type: "array", items: { type: "integer",},},
                s_b: { type: "array", items: { type: "integer",},},
                // MINUTE schedule types
                m: { type: "array", items: { type: "integer",},},
                m_a: { type: "array", items: { type: "integer",},},
                m_b: { type: "array", items: { type: "integer",},},
                // HOUR schedule types
                h: { type: "array", items: { type: "integer",},},
                h_a: { type: "array", items: { type: "integer",},},
                h_b: { type: "array", items: { type: "integer",},},
                // DAY schedule types
                // int representation of day of the week 1-7 
                d: { type: "array", items: { type: "integer",},},
                d_a: { type: "array", items: { type: "integer",},},
                d_b: { type: "array", items: { type: "integer",},},
                // int representation of day of the month 0-31 ( 0 for last )
                D: { type: "array", items: { type: "integer",},},
                D_a: { type: "array", items: { type: "integer",},},
                D_b: { type: "array", items: { type: "integer",},},
                // int representation of the integer of types a 
                // day has ocurred within a week 0-5 ( 0 for last )
                dc: { type: "array", items: { type: "integer",},},
                dc_a: { type: "array", items: { type: "integer",},},
                dc_b: { type: "array", items: { type: "integer",},},
                // int representation of day of the year 0-366 ( 0 for last )
                dw: { type: "array", items: { type: "integer",},},
                dw_a: { type: "array", items: { type: "integer",},},
                dw_b: { type: "array", items: { type: "integer",},},
                // MONTH schedule types
                M: { type: "array", items: { type: "integer",},},
                M_a: { type: "array", items: { type: "integer",},},
                M_b: { type: "array", items: { type: "integer",},},
                // MONTH schedule types
                Y: { type: "array", items: { type: "integer",},},
                Y_a: { type: "array", items: { type: "integer",},},
                Y_b: { type: "array", items: { type: "integer",},},
              },
            },
          },
        },
      },
    },
    href: { type: "string", },
    contributors: {
      type: "array",
      items: {
        type: "string",
      },
    },
    created: { 
      type: "string",
      format: "date-time", 
    },
    updated: { 
      type: "string",
      format: "date-time",
    }
  },
  additionalProperties: false,
};

export const grpValidate = ajv.compile(GrpSchema);
/**
 * This method adds timestamps updated/created to the input GRP, then
 * it validated the input GRP and if nothing is incorrect it is stored
 * in mongo.
 * @param {Object} newGrp - the object to be validated and stored
 */
export function createGrp(newGrp){
  return co(function* (){
    let grps = yield getGrpCollection();
    addGrpTimestamps(newGrp);
    //validate the input fields
    let valid = grpValidate(newGrp); 
    if(!valid){
      log.error(newGrp);
      throw grpValidate.errors; 
    }
    //insert the new grp
    return yield grps.insert(newGrp);
  });
};
/**
 * This method get the current time, and adds that time as both the created
 * and updated properties.
 * @param {Object} grp - a GRP object
 */
export function addGrpTimestamps(grp){
  let now = moment().toISOString();
  grp.created = now;
  grp.updated = now;
};
/**
 * This method changes the updated field of a GRP to the current time
 * @param {Object} grp - a GRP object
 */
export function updateGrpTimestamps(grp){
  let now = moment().toISOString();
  grp.updated = now;
};

var limit = 100;
/**
 * This method generates count number of dates from to until. The dates are
 * generated based on the recurrences stored within the GRP schedules. All of
 * these are retrieved and based on that all of the schedules are generated. 
 * @param {Object} grp - a GRP object
 * @param {Number} count - an integer specifying the max number of dates that can be generated
 * @param {Date} from - the starting date from which to generate dates.
 * @param {Date} end - the ending date until which to generate dates.
 * @return {Array<Date>} - the calculated dates
 */
export function getNextGrpDatesFromUntil(grp, count, from, until){
  //get the schedules and create an array of theme
  let schedules = map(grp.schedules, (event) => {
    return event.recurrences[0];
  });
  if(size(schedules) == 0){
    // no dates available
    return [];
  }
  if(!count){
    count = limit;
  }
  //create a composite schedule with all the schedules for
  //this grp
  let schedule = later.schedule({schedules: schedules});
  if(!from && !until){
    return schedule.next(count);
  } else if(!from) {
    return schedule.next(count, undefined, until);
  } else if(!until){
    return schedule.next(count, from);
  } else {
    return schedule.next(count, from, until);
  }
};

var promise = undefined;
/**
 * This method returns a promise to a {@link http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html|Mongo Collection}
 * of GRP. The method will make sure to connect to the DB before returning the collection.
 * @return {Promise<Collection>} a Mongo DB Collection
 */
export function getGrpCollection(){
  if(!promise){
    promise = new Promise((resolve, reject) => {
      getConnection().then((db) => {
        resolve(db.collection('grps'));
        return db;
      }).catch((err) => {
        reject(err);
      });
    });      
  }
  return promise;
};

