import { pick, map, size } from 'lodash';
import co from 'co';
import later from 'later';
import Promise from 'bluebird';
import Ajv from 'ajv';
import moment from 'moment';
import { toGlobalId } from '@/misc/global_id';
import { getConnection } from '@/connectors/mongodb';
import { getNextGrpDatesFromUntil } from '@/api/mongo/grp/model';
import log from '@/log';

/* En Event is an Object we store for a specific event instead
 * of the recurrent rules for a series of a specific type of 
 * events. This is used for faster searching on GRPs 
 */
later.date.localTime();

const ajv = new Ajv();

export const EventSchema = {
  type: "object",
  properties: {
    _id: {
      oneOf: [
        { type: "string" },
        { type: "object" },
      ],
    },
    grp: {
      oneOf: [
        { type: "string" },
        { type: "object" },
      ],
    },
    name: { type: "string" },
    date: {
      type: "string",
      format: "date-time",
    },
    type: { type: "string" },
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
      },
    },
  },
};

export const eventValidate = ajv.compile(EventSchema);

export function removeAllEventsOlderThan(date){

};

export function removeEventsOlderThan(grp, date){
  
};

export function getEventsFromUntil(grp, from, until){
  if(!grp || !grp.schedules){
    return [];
  }
  //console.log(`from: ${from.toString()}`);
  //console.log(`until: ${until.toString()}`);
  let dates = getNextGrpDatesFromUntil(grp, 3000, from, until);
  let events = map(dates, (date) => {
    return {
      date: date,
      grp: grp._id,
      name: grp.name,
      type: undefined, 
      location: grp.location,
    }
  });
  return events;
}

var promise = undefined;

export function getEventCollection(){
  if(!promise){
    promise = new Promise((resolve, reject) => {
      getConnection().then((db) => {
        resolve(db.collection('events'));
        return db;
      }).catch((err) => {
        reject(err);
      });
    });      
  }
  return promise;
};


