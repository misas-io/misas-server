import { pubsub } from './subscriptions';
import { Grp } from '@/api/mongo/grp/model';


const resolveFunctions = {
  RootQuery: {
    grp() {
      return Grp.find({}).exec();
    },
  },
  Mutation: {
    addGrp(_, { name, type, location }) {
      //add the new grp to mongodb
      let grp = new Grp({
        type: type,
        name: name,
        location: location || {},
      });
      return grp.save();
    },
  },
  Subscription: {
    postUpvoted(post) {
      return {};
    },
  },
  Grp: {
    contributors(grp) {
      return grp.contributors;
    },
    location(grp) {
      return grp.location;
    },
  },
  Location: {
    address(loc) {
      return loc.address;
    },
  },
};

export default resolveFunctions;
