import { pick, map, size } from 'lodash';
import co from 'co';
import later from 'later';
import Promise from 'bluebird';
import Ajv from 'ajv';
import moment from 'moment';
import { toGlobalId } from '@/misc/global_id';
import { getConnection } from '@/connectors/mongodb';
import log from '@/log';

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

export function addGrpTimestamps(grp){
  let now = moment().toISOString();
  grp.created = now;
  grp.updated = now;
};

export function updateGrpTimestamps(grp){
  let now = moment().toISOString();
  grp.updated = now;
};

var limit = 100;

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

