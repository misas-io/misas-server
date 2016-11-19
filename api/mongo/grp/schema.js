import PaginationSchema from '@/api/misc/pagination/schema';
import NodeSchema from '@/api/misc/node/schema';

const GrpSchema = `
# A god realted place stored in MongoDB
type Grp implements Node {
  id: ID!
  type: GrpType!
  name: String!
	address: Address
  location: Location 
  contributors: [ String ]
  created: String
  updated: String
}

type GrpType {
  name: String!
  religion: Religion!
}

type Religion {
  name: String!
}

# The exact lat, lon location of the church
type Location {
  type: String
  #lat then lon
  coordinates: [ Float! ]
}

type Address {
  #the address lines contain the actual street address 
  address_line_1: String!
  address_line_2: String
  address_line_3: String
  country: String!
  city: String
  state: String
  #zip code in the us but it can be any postal code
  postal_code: Int
}

enum SortTypes {
  RELEVANCE
  CLOSEST 
  ALPHABETICAL 
}

input LocationI {
  type: String!
  #lat the lon
  coordinates: [ Float! ]!
}

input AddressI {
  #the address lines contain the actual street address 
  address_line_1: String!
  address_line_2: String
  address_line_3: String
  country: String!
  city: String
  state: String
  #zip code in the us but it can be any postal code
  postal_code: Int
}

input PolygonI {
  coordinates: [ Float! ]!
}


`;

export default [ GrpSchema, ...PaginationSchema, ...NodeSchema ];

