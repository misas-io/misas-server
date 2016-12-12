import NodeSchema from '@/api/misc/node/schema';

const EdgeSchema = `
  type PageInfo {
    hasNextPage: Boolean!
  }

  type Page {
    edges: [Edge!]!
    pageInfo: PageInfo
  }

  type Edge {
    cursor: String!
    node: Node!
  }
`;

export default [ EdgeSchema, ...NodeSchema ];
