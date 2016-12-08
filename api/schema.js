import { makeExecutableSchema } from 'graphql-tools';
import GrpSchema from '@/api/mongo/grp/schema';
import EdgeSchema from '@/api/misc/edge/schema';
import resolvers from '@/api/resolvers';

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
      sortBy: SortTypes,
      first: Int,
      after: String 
    ): Page! 
    # node query
    node(id: ID!): Node
  }

  type Mutation {
    #creates a new grp
    createGrp(
      #name of the grp
      name: String!,
      #type of the grp
      type: String!,
      #location of the grp 
      location: LocationI!
      #events not required
      events: [ EventI ]
    ): Grp
    #adds events a grp
    addGrpEvents(
      #global id of grp
      id: ID!
      #array of events
      events: [ EventI! ]!
    ): [ Event! ]!
    #removes events
    removeGrpEvents(
      #global id of grp
      id: ID!
      #array of indexes
      events: [ Int! ]!
    ): [ Event! ]!

  }

  type Subscription {
    postUpvoted(grpId: String!): Grp
  }

`;

export default makeExecutableSchema({
  typeDefs: [schema, ...GrpSchema, ...EdgeSchema],
  resolvers,
});
