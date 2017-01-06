import Promise from 'bluebird';
import 'moment-timezone';
import moment from 'moment';
import co from 'co';
import util from 'util';
import { map, each, set, isString, isNil, isNumber, isInteger, isArray } from 'lodash';
import geodist from 'geodist';
import { toGlobalId, fromGlobalId } from '@/lib/misc/global_id';
import { intFromBase64 } from '@/lib/misc/base_64';
import { Grp } from '@/lib/api/mongo/grp/model';
import { createGrp, getGrpCollection, getNextGrpDatesFromUntil } from '@/lib/api/mongo/grp/model';
import { getEventCollection } from '@/lib/api/mongo/event/model';
import MongoDB from 'mongodb';
import { edgeify } from '@/lib/api/mongo/utils/edgeification';
import log from '@/lib/log';
import { getLogger } from '@/lib/log';
import geoJsonValidation from 'geojson-validation';

log.verbose('hey there!');

const grpCollation = {
  locale: "es",
  strength: 1,
};

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
  /**
   * This is a resolver function as defined in {@link http://dev.apollodata.com/tools/graphql-tools/resolvers.html|Apollo's resolver docs}
   * it will return a promise which should return an array of GRPs if the function succesfully 
   * queried the DB. 
   *
   * @param {undefined} _ - takes nothing as the first input this is to ignore context
   * @param {Object} parms - parameters to the searchGrps query function
   * @param {String=} parms.name - the name of the GRP where order and spaces don't matter
   * @param {Object=} parms.polygon - A polygon represention using coordinates 
   * @param {Array.<Array.<Float>>=} parms.polygon.coordinates - the actual array of [lat,lon] coordinates of the polygon
   * @param {Array.<Float>=} parms.point - An array [lat,lon] specifying the coordinates of a point
   * @param {String=} parms.sortBy - A String specifying the order by which to sort eg. TIME, BEST, etc.
   * @param {String=} parms.city - A String specifying the name of a city (case, accent's, etc don't matter)
   * @param {String=} parms.state - A String specifying the name of a state (case, accent's, etc don't matter)
   * @param {Number=} parms.first - A Number for the 'first' number of GRPs to return 
   * @param {String=} parms.after - An opaque ID String specifying the offset from the 0's result of the query 
   * @return {Promise<Object[]>} - the GRPs from search
   */
  searchGrps: (
    _, 
    parms,
    context
  ) => {
    let log = getLogger();
    let {
      name, 
      polygon, 
      point, 
      sortBy, 
      city,
      state,
      first, 
      after
    } = parms;
    log.verbose("%j", parms);
    // parameters validation
    let scoreOption = {};
    let sortByOption = {};
    let geoQueryOption = {};
    let nameOption = {};
    let pageInfo = {};
    let index = -1;
    let cityOption = {};
    let stateOption = {};
    let tzDate = moment().tz('America/Denver');
    let currentTS = moment(tzDate).utc().add(tzDate.utcOffset(), 'm');
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
        context.point = point;
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
      // check city and state options
      if (isString(city)){
        if (sortBy != 'NEAR' && sortBy != 'RELEVANCE') {
          set(cityOption, 'city.$eq', city);
        } else {
          set(cityOption, ['address.city','$eq'], city);
        }
      }
      if (isString(state)){
        if (sortBy != 'NEAR' && sortBy != 'RELEVANCE') {
          set(stateOption, 'state.$eq', state);
        } else {
          set(stateOption, ['address.state','$eq'], state);
        }
      }
      // check/add sort criteria
      let pipeline;
      let events;
      let grps;
      /********************************/
      /* query based on SORT criteria */
      /********************************/
      switch(sortBy){
        case "RELEVANCE": 
          grps = yield getGrpCollection();
          set(sortByOption,'score.$meta', "textScore");
          set(scoreOption, 'score.$meta', "textScore");
          var query = {
            ...nameOption,
            ...geoQueryOption,
            ...cityOption,
            ...stateOption,
          };
          // search on the criteria, generate paginated result
          // get grps collection
          let cursor = grps
          .find(
            query,
            scoreOption
          )
          .collation(
            grpCollation
          )
          .sort(
            sortByOption
          )
          .limit(first+1)
          .skip(index+1);
          return cursor
          .toArray()
          .then((results) => {
            log.verbose("%j", results);
            return edgeify(index+1, results, first);
          });
        case "BEST":
          // get the best grp based on location and next event available on that
          // grp
          if (!point) {
            throw 'A point must be specified when sorting by BESTness';
          }
          if (name) {
            throw 'BEST...ness soring does not support searching for text terms';
          }
          let textQuery = {};
          pipeline = [
            { 
              $geoNear: {
                near: point,
                spherical: true,
                distanceField: 'distance',
                limit: 250000,
                query: {
                  $and: [ 
                    cityOption,
                    stateOption,
                    { date: { $gt: currentTS, }, },
                  ],
                },
              },
            },
            { $group: { _id: '$grp', date: { $min: '$date' }, distance: { $first: '$distance' }}}, 
            { $project: 
              { 
                distance: 1,
                rating: { 
                  $add: [
                    /* calculate minutes to destination by dividing distance by 300 m / minute */
                    {
                      $divide: [ 
                        '$distance',
                        300 
                      ]
                    },
                    /* calculate minutes till the start of next event */
                    { 
                      $divide: [ 
                        { 
                          $subtract: [ 
                            '$date', currentTS 
                          ]
                        }, 
                        60 * 1000 
                      ]
                    },
                  ]
                },
                grp: 1
              }
            },
            { $sort: { rating: 1 }},
            //the following stage should always be the same
            { $limit: first },
            { $skip: index+1 },
            { 
              $lookup: { 
                from: 'grps', 
                localField: '_id', 
                foreignField: '_id', 
                as: 'grp'
              }
            },
          ];
          // BEST sorting
          log.silly("%j", pipeline);
          events = yield getEventCollection();
          return yield events.aggregate(pipeline, { collation: grpCollation})
          .toArray().then((results) => {
            log.info(`got ${results.length} grps`);
            log.verbose("%j", results);
            let grps = map(results, (result, key) => {
              return {
                ...result.grp[0],
                distance: result.distance,
              };
            });
            return edgeify(index+1, grps, first);
          });
        case "NEAR":
          // get the nearest church, this must use a point else it
          // will fail. results maybe be filtered further by a polygon
          // or keywords
          if (!point) {
            throw 'A point must be specified when sorting by NEAR...ness';
          }
          if (name) {
            throw 'NEAR...ness soring does not support searching for text terms';
          }
          pipeline = [
            { 
              $geoNear: {
                near: point,
                spherical: true,
                distanceField: 'distance',
                query: {
                  $and: [ 
                    cityOption,
                    stateOption,
                  ],
                },
              },
            },
          ];
          log.silly("%j", pipeline);
          grps = yield getGrpCollection();
          return yield grps.aggregate(pipeline, { collation: grpCollation})
          .limit(first)
          .skip(index+1)
          .toArray().then((results) => {
            log.info(`got ${results.length} grps`);
            log.verbose("%j", results);
            return edgeify(index+1, results, first);
          });
        case "TIME":
        default:
          // get the church with earliest event, this will need filtering
          // with either a polygon or keywords
          events = yield getEventCollection();
          pipeline = [
            { $sort: { date: 1 } }, 
            { 
              $match: { 
                $and: [ 
                  {'date': { $gte: currentTS } },
                  cityOption,
                  stateOption,
                ]
              }
            }, 
            { $group: { _id: '$grp', date: { $min: '$date' }}}, 
            { $sort: { date: 1}}, 
            //the following stage should always be the same
            { 
              $lookup: { 
                from: 'grps', 
                localField: '_id', 
                foreignField: '_id', 
                as: 'grp'
              }
            }
          ];
          log.silly("%j", pipeline);
          return yield events.aggregate(pipeline, { collation: grpCollation})
          .limit(first)
          .skip(index+1)
          .toArray().then((results) => {
            let grps = map(results, (result, key) => {
              return result.grp[0];
            });
            log.info(`got ${grps.length} grps`);
            log.verbose("%j", grps);
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
    distance(grp, _, context) {
      // if there is already a distance, or point is null, or
      // the GRP's location is null
      if (isNumber(grp.distance)){
        return grp.distance;
      }
      if (isNil(context.point) ||
          isNil(grp.location)) {
        return;
      }
      // check the schema for a point used by previous query
      // if it exists then use it to calculate the distance
      let pointCoordinates = context.point.coordinates;
      let grpCoordinates = grp.location.coordinates; 
      let from = {
        lat: pointCoordinates[1], 
        lon: pointCoordinates[0],
      };
      let to = {
        lat: grpCoordinates[1], 
        lon: grpCoordinates[0],
      };
      let result = geodist(
        from,
        to,
        {
          unit: 'meters',
        }
      );
      return result;
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
