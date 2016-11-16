import { Grp } from '@/api/mongo/grp/model';
import log from '@/log';

export const GrpQueryResolvers = {
  grp(_, {id}){
    return Grp.findById(_id).exec();
  },
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
  Grp: {
    contributors(grp) {
      return grp.contributors || [];
    },
    location(grp) {
      return grp.location || {
      };
    },
  },
  Location: {
    address(loc) {
      log.info(loc);
      if(loc.address) {
        let address = loc.address;
        return loc.address || {
          address_line_1: address.address_line_1 || "",
          address_line_2: address.address_line_2 || "",
          country: address.country || "",
          city: address.city || "",
          state: address.state || "NA",
          postal_code: address.postal_code 
        };
      } else {
        return {
          address_line_1: "",
          address_line_2: "",
          country: "",
          city: "",
          state: "NA",
          postal_code: -1 
        };
      }
    },
  },
}
