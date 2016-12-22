import Promise from 'bluebird';
import co from 'co';
import util from 'util';
import { map, each, set, isString, isNil, isNumber, isInteger } from 'lodash';
import { toGlobalId, fromGlobalId } from '@/misc/global_id';
import { intFromBase64 } from '@/misc/base_64';
import { Grp } from '@/api/mongo/grp/model';
import { createGrp, getGrpCollection, getNextGrpDatesFromUntil } from '@/api/mongo/grp/model';
import { getEventCollection } from '@/api/mongo/event/model';
import MongoDB from 'mongodb';
import { edgeify } from '@/api/mongo/utils/edgeification';
import log from '@/log';
import geoJsonValidation from 'geojson-validation';

function checkPolygon(json){
  var promise = new Promise((resolve, reject) => {
    geoJsonValidation.isPolygon(json, (valid, errors) => {
      resolve({valid: valid, errors: errors});
    });
  });
  return promise;
};

function checkPoint(json){
  var promise = new Promise((resolve, reject) => {
    geoJsonValidation.isPoint(json, (valid, errors) => {
      resolve({valid: valid, errors: errors});
    });
  });
  return promise;
};



export const GrpQueryResolvers = {
  grp: (_, {id}) => {
    let { type, localId } = fromGlobalId(id);
    return co(function* (){
      var grps = yield getGrpCollection();
      var objectId = new MongoDB.ObjectID(localId);
      //console.log(util.inspect(grps, { depth: 4, colors: true }));
      log.info(`type: ${type}, id: ${localId}`);
      var grp = yield grps.findOne({_id: objectId});
      //log.info(grp);
      return grp;
    });
  },
  searchGrps: (
    _, 
    {
      name, 
      polygon, 
      point, 
      sortBy, 
      city,
      state,
      first, 
      after
    }
  ) => {
    // parameters validation
    let scoreOption = {};
    let sortByOption = {};
    let geoQueryOption = {};
    let nameOption = {};
    let pageInfo = {};
    let index = -1;
    let cityOption = { match: {}};
    let stateOption = { match: {}};
    return co(function* (){
      // check/add geographic criteria 
      if(!isNil(polygon)){
        set(polygon, 'type', 'Polygon');
        set(polygon, 'coordinates', [ polygon.coordinates ]);
        var {valid, errors} = yield checkPolygon(polygon);
        if(!valid){
          log.error("invalid polygon was specified", errors);
        }
        // set polygon type here
        set(geoQueryOption, 'location.$geoWithin.$geometry', polygon);
      }
      // check/add nearness criteria
      if(!isNil(point)){
        set(point, 'type', 'Point');
        set(point, 'coordinates', point.coordinates );
        var {valid, errors} = yield checkPoint(point);
        if(!valid){
          log.error("invalid point was specified", errors);
        }
        // set point type here
        set(geoQueryOption, 'location.$geoWithin.$geometry', point);
      }

      // check/add pagination to query
      // first is the number of elements to return
      if(!isNumber(first) || 
         first < 0 || 
         20 < first
        ){
          first = 10;
      } 
      // after is the location after which to return
      if(isString(after)){
        // get index from 
        index = intFromBase64(after);;
      }
      // add/check query name
      if(isString(name)){
        set(nameOption, '$text.$search', name);
      }
      // check/add sort criteria
      log.info("searchGrps()\nquery: ", query);
      log.info("first: ", first);
      log.info("after: ", index);
      let pipeline;
      let events;
      let grps;
      if (isString(city)){
        set(cityOption, 'match.city.$eq', city);
      }
      if (isString(state)){
        set(stateOption, 'match.state.$eq', state);
      }
      switch(sortBy){
        case "RELEVANCE": 
          grps = yield getGrpCollection();
          set(sortByOption,'score.$meta', "textScore");
          set(scoreOption, 'score.$meta', "textScore");
          var query = {
            ...nameOption,
            ...geoQueryOption,
          };
          // search on the criteria, generate paginated result
          // get grps collection
          let cursor = grps
          .find(
            query,
            scoreOption
          )
          .sort(
            sortByOption
          )
          .limit(first+1)
          .skip(index+1);
          return cursor
          .toArray()
          .then((results) => {
            return edgeify(index+1, results, first);
          });
        case "BEST":
          // TODO: will try to guess the best church based on location
          // and other stuff
          log.error('Not yet implemented');
          break;
        case "NEAR":
          // get the nearest church, this must use a point else it
          // will fail. results maybe be filtered further by a polygon
          // or keywords
          log.info("orderby: NEAR");
          if (!point) {
            throw 'A point must be specified when sorting by NEAR...ness';
          }
          let textQuery = {};
          pipeline = [
            { 
              $geoNear: {
                near: point,
                spherical: true,
                distanceField: 'distance',
                query: {
                  $and: [ 
                    cityOption.match,
                    stateOption.match,
                  ],
                },
              },
            },
          ];
          console.log(util.inspect(pipeline, { depth: 6, colors: true }));
          grps = yield getGrpCollection();
          return yield grps.aggregate(pipeline)
          .limit(first)
          .skip(index+1)
          .toArray().then((results) => {
            log.info(`got ${results.length} grps`);
            return edgeify(index+1, results, first);
          });
          break;
        case "TIME":
        default:
          // get the church with earliest event, this will need filtering
          // with either a polygon or keywords
          log.info("orderby: TIME");
          events = yield getEventCollection();
          pipeline = [
            { $sort: { date: 1 } }, 
            { 
              $match: { 
                $and: [ 
                  {'date': { $gte: new Date() } },
                  cityOption.match,
                  stateOption.match,
                ]
              }
            }, 
            { $group: { _id: '$grp', date: { $min: '$date' }}}, 
            { $sort: { date: 1}}, 
            { 
              $lookup: { 
                from: 'grps', 
                localField: '_id', 
                foreignField: '_id', 
                as: 'grp'
              }
            }
          ];
          return yield events.aggregate(pipeline)
          .limit(first)
          .skip(index+1)
          .toArray().then((results) => {
            //log.info(results);
            let i = 0;
            let grps = map(results, (result, key) => {
              //log.info(result);
              return result.grp[0];
            });
            //log.info(grps);
            log.info(`got ${grps.length} grps`);
            return edgeify(index+1, grps, first);
          });
      }
    });
  }
};

export const GrpMutationResolvers = {
  noop: () => {
    return null; 
  }
};

export const GrpResolvers = {
  Node: {
    __resolveType(root, context, info){
      return 'Grp';
    },
  },
  Page: {
    edges(edges){
      return edges.edges;
    }
  },
  Edge: {
    cursor(edge){
      return edge.cursor || {};
    },
    node(edge){
      return edge.node || {};
    },
  },
  Grp: {
    id(grp) {
      return toGlobalId("grps", grp._id);
    },
    contributors(grp) {
      return grp.contributors || [];
    },
    location(grp) {
      return grp.location || {
        type: null,
        coordinates: [],
      };
    },
    address(grp) {
      return grp.address || {
        address_line_1: grp.address.address_line_1 || "",
        address_line_2: grp.address.address_line_2 || "",
        address_line_3: grp.address.address_line_3 || null,
        country: grp.address.country || "Not available",
        city: grp.address.city || null,
        state: grp.address.state || null, 
        postal_code: grp.address.postal_code || null,
      };
    },
    nextEvents(grp, { next }) {
      let nextV = !isInteger(next) ? 10 : 0 <= next && next <= 100 ? next : 10;
      return getNextGrpDatesFromUntil(grp, next);
    }
  },
  Recurrence: {
  }
};
