import { merge, isString } from 'lodash';
import { pubsub } from '@/lib/api/subscriptions';
import { Grp } from '@/lib/api/mongo/grp/model';
import { GrpQueryResolvers, GrpMutationResolvers, GrpResolvers } from '@/lib/api/mongo/grp/resolvers'
import { fromGlobalId } from '@/lib/misc/global_id';
import log from '@/lib/log';


const resolveFunctions = {
  RootQuery: merge(
    {
      node(_, {id}) {
        let { type, localId } = fromGlobalId(id);
        log.info(`getting node(${type},${localId})`);
        switch(type){
          case "grps":
            return GrpQueryResolvers.grp(undefined, {id: id});
          default:
            log.error("unsupported node");
        }          
      }
    }, 
    GrpQueryResolvers
  ),
  Subscription: {
    postUpvoted(post) {
      return {};
    },
  },
};

export default merge(resolveFunctions, GrpResolvers);
