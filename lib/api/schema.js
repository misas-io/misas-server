import { makeExecutableSchema } from 'graphql-tools';
import GrpSchema from '@/api/mongo/grp/schema';
import EdgeSchema from '@/api/misc/edge/schema';
import resolvers from '@/api/resolvers';
import util from 'util';

const schema = `
  schema {
    query: RootQuery
    mutation: Mutation
    subscription: Subscription
  }
  type RootQuery {
    # god related place queries
    grp(id: ID!): Grp 
    #
    # The following shows an example query on the paginated
    # searchGrps function.
    #
    # {
    #   searchGrps(
    #     name: "maria",
    #     sortBy: RELEVANCE,
    #     after: "MTA="
    #   )
    #   {
    #     edges {
    #       cursor
    #       node {
    #         id
    #         ... on Grp {
    #           name
    #         }
    #       }
    #     }
    #     pageInfo {
    #       hasNextPage
    #     }
    #   }
    # }
    #
    searchGrps(
      name: String,
      polygon: PolygonI,
      point: PointI,
      sortBy: SortTypes,
      city: String,
      state: String,
      first: Int,
      after: String 
    ): Page! 
    # node query
    node(id: ID!): Node
  }

  type Mutation {
    noop: String
  }

  type Subscription {
    postUpvoted(grpId: String!): Grp
  }

`;


const preCompiledSchema = [schema, ...GrpSchema, ...EdgeSchema]; 
/* DEBUGGIN PURPOSES FOR SCHEMA */
//console.log(util.inspect(preCompiledSchema, false, null));

export default makeExecutableSchema({
  typeDefs: preCompiledSchema,
  resolvers,
});
