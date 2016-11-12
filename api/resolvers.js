import { pubsub } from './subscriptions';
import { Grp } from '@/api/mongo/grp/model';
import log from '@/log';


const resolveFunctions = {
  RootQuery: {
    grp(_, { _id }) {
      return Grp.findById(_id).exec();
    },
    grps(_, { pagination }) {
      let query = Grp.find({});
      if(pagination){
        query = query.
          limit(pagination.size).
          skip(pagination.size*pagination.page);
      }
      log.info(pagination)
      return query.exec();
    },
    grpsSearch(_, { q, pagination }) {
      log.info(pagination)
      return Grp.find({}).exec();
    }
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
