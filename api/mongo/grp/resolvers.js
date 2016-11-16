import { each } from 'lodash';
import { Grp } from '@/api/mongo/grp/model';
import { toGlobalId, fromGlobalId } from '@/misc/global_id';
import log from '@/log';

export const GrpQueryResolvers = {
  grp(_, {id}){
    let { type, localId } = fromGlobalId(id);
    return Grp.findById(localId).exec();
  },
  searchGrps(_, {name}){
    return Grp.find({
      $text: {
        $search: name || "",
      }
    }).exec();
  }
};

export const GrpMutationResolvers = {
  createGrp(_, { name, type, location }) {
    //add the new grp to mongodb
    let grp = new Grp({
      type: type,
      name: name,
      location: location || {},
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
        lat: null,
        lon: null,
      };
    },
  },
  Location: {
    address(loc) {
      return loc.address || {
        address_line_1: address.address_line_1 || "",
        address_line_2: address.address_line_2 || "",
        address_line_3: address.address_line_3 || null,
        country: address.country || "Not available",
        city: address.city || null,
        state: address.state || null, 
        postal_code: address.postal_code || null,
      };
    },
  },
}
