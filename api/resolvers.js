import { merge, isString } from 'lodash';
import { pubsub } from './subscriptions';
import { Grp } from '@/api/mongo/grp/model';
import { GrpQueryResolvers, GrpMutationResolvers, GrpResolvers } from '@/api/mongo/grp/resolvers'
import { fromGlobalId } from '@/misc/global_id';
import log from '@/log';


const resolveFunctions = {
  RootQuery: merge(
    {
      node(_, {id}) {
        let { type, localId } = fromGlobalId(id);
        log.info(`getting node(${type},${localId})`);
        
      }
    }, 
    GrpQueryResolvers),
  Mutation: merge(
    {}, 
    GrpMutationResolvers),
  Subscription: {
    postUpvoted(post) {
      return {};
    },
  },
  ...GrpResolvers,
};

export default resolveFunctions;
