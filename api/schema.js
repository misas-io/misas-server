import { makeExecutableSchema } from 'graphql-tools';
import GrpSchema from '@/api/mongo/grp/schema';
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
    searchGrps(
      name: String,
      rectangle: ReactangleI
      sortBy: [SortTypes]
    ): [Grp]
    # node query
    node(id: ID!): Node
  }

  type Mutation {
    createGrp(
      #name of the grp
      name: String!,
      #type of the grp
      type: String!,
      #location of the grp 
      location: LocationI!
    ): Grp
  }

  type Subscription {
    postUpvoted(grpId: String!): Grp
  }

`;

export default makeExecutableSchema({
  typeDefs: [schema, ...GrpSchema],
  resolvers,
});
