import Promise from 'bluebird';
import ObjectID from 'mongodb';
import co from 'co';
import { each, set, isString, isNil, isNumber, isInteger } from 'lodash';
import { toGlobalId, fromGlobalId } from '@/misc/global_id';
import { intFromBase64 } from '@/misc/base_64';
import { Grp } from '@/api/mongo/grp/model';
import { createGrp, getGrpCollection, getNextGrpDatesFromUntil } from '@/api/mongo/grp/model';
import { edgeify } from '@/api/mongo/utils/edgeification';
import log from '@/log';
import geoJsonValidation from 'geojson-validation';
import { EventResolvers, EventMutationResolvers } from '@/api/mongo/event/resolvers';

function checkPolygon(json){
  var promise = new Promise((resolve, reject) => {
    geoJsonValidation.isPolygon(json, (valid, errors) => {
      resolve({valid: valid, errors: errors});
    });
  });
  return promise;
};

export const GrpQueryResolvers = {
  grp: (_, {id}) => {
    let { type, localId } = fromGlobalId(id);
    let objectId = new ObjectID(localId);
    log.info(`type: ${type}, id: ${localId}`);
    return co(function* (){
      var grps = yield getGrpCollection();
      var grp = yield grps.findOne({_id: localId});
      log.info(grp);
      return grp;
    });
  },
  searchGrps: (_, {name, polygon, sortBy, first, after}) => {
    // parameters validation
    let scoreOption = {};
    let sortByOption = {};
    let geoQueryOption = {};
    let nameOption = {};
    let pageInfo = {};
    let index = -1;
    return co(function* (){
      // check/add sort criteria
      if(isString(sortBy)){
        switch(sortBy){
          case "RELEVANCE": 
            set(sortByOption,'score.$meta', "textScore");
            set(scoreOption, 'score.$meta', "textScore");
            break;
          default:
            log.error("searchGrps: sortBy not supported");
        }
      }
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
      var query = {
          ...nameOption,
          ...geoQueryOption,
      };
      // search on the criteria, generate paginated result
      log.info("searchGrps()\nquery: ", query);
      log.info("first: ", first);
      log.info("after: ", index);
      // get grps collection
      let grps = yield getGrpCollection();
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
    });
  }
};

export const GrpMutationResolvers = {
  ...EventMutationResolvers,
  createGrp: (_, { name, type, address, location }) => {
    //add the new grp to mongodb
    let grp = {
      type: type,
      name: name,
      address: address,
      location: location,
    };
    return createGrp(grp);
  }
};

export const GrpResolvers = {
  ...EventResolvers,
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
