import PaginationSchema from '@/api/misc/pagination/schema';
import NodeSchema from '@/api/misc/node/schema';

const GrpSchema = `
# A god realted place stored in MongoDB
type Grp implements Node {
  id: ID!
  type: GrpType!
  name: String!
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
	address: Address
  #latitude
  lat: Float
  #longitude
  lon: Float
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
	address: AddressI!
  #latitude
  lat: Float
  #longitude
  lon: Float
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

input PointI {
  lat: Float!
  lon: Float!
}

input RectangleI {
  upperLeft: PointI!
  lowerRight: PointI!
}


`;

export default [ GrpSchema, ...PaginationSchema, ...NodeSchema ];

