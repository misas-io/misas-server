import { each, set, isString } from 'lodash';
import { Grp } from '@/api/mongo/grp/model';
import { toGlobalId, fromGlobalId } from '@/misc/global_id';
import log from '@/log';

export const GrpQueryResolvers = {
  grp(_, {id}){
    let { type, localId } = fromGlobalId(id);
    return Grp.findById(localId).exec();
  },
  searchGrps(_, {name, polygon, sortBy}){
    let scoreOption = {};
    let sortByOption = {};
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
    return Grp
      .find(
        {
          $text: {
            $search: name || "",
          },
        }, 
        scoreOption
      )
      .sort(
        sortByOption
      ).exec();
  }
};

export const GrpMutationResolvers = {
  createGrp(_, { name, type, address, location }) {
    //add the new grp to mongodb
    let grp = new Grp({
      type: type,
      name: name,
      address: address,
      location: location,
    });
    return grp.save();
  }
};

export const GrpResolvers = {
  Node: {
    __resolveType(root, context, info){
      return 'Grp';
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
  },
};
