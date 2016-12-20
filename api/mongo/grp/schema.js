import NodeSchema from '@/api/misc/node/schema';
import EdgeSchema from '@/api/misc/edge/schema';

const GrpSchema = `

# A god realted place stored in MongoDB
type Grp implements Node {
  id: ID!
  type: GrpType!
  name: String!
	address: Address
  location: Location 
  schedules: [ Schedule! ]
  nextEvents(next: Int): [ String! ]!
  contributors: [ String ]
  created: String
  updated: String
  # contains recurring events
}

type GrpType {
  name: String!
  religion: Religion!
}

type Religion {
  name: String!
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

# The exact lat, lon location of the church
type Location {
  type: String
  #lat then lon
  coordinates: [ Float! ]
}

type Schedule {
  name: String!
  duration: Int!
  recurrences: [ Recurrence! ]!
}

type Recurrence {
  s: [ Int! ] 
  s_a: [ Int! ] 
  s_b: [ Int! ] 
  m: [ Int! ]! 
  m_a: [ Int! ] 
  m_b: [ Int! ] 
  h: [ Int! ]
  h_a: [ Int! ] 
  h_b: [ Int! ] 
  d: [ Int! ] 
  d_a: [ Int! ] 
  d_b: [ Int! ] 
  D: [ Int! ] 
  D_a: [ Int! ] 
  D_b: [ Int! ] 
  dc: [ Int! ] 
  dc_a: [ Int! ] 
  dc_b: [ Int! ] 
  dw: [ Int! ] 
  dw_a: [ Int! ] 
  dw_b: [ Int! ] 
  M: [ Int! ] 
  M_a: [ Int! ] 
  M_b: [ Int! ] 
  Y: [ Int! ] 
  Y_a: [ Int! ] 
  Y_b: [ Int! ] 
}

enum SortTypes {
  # sort by search terms relevance
  RELEVANCE
  # sort by church closest
  CLOSEST 
  # sort by church name
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
  coordinates: [ [ Float! ]! ]!
}

`;

export default [ GrpSchema, ...NodeSchema, ...EdgeSchema ];

