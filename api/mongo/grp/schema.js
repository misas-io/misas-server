import PaginationSchema from '@/api/misc/pagination/schema';

export const GrpSchema = `
# A church object stored in MongoDB
type Grp {
  _id: String!
  type: String!
  name: String!
  location: Location 
  contributors: [ String ]
  created: String
  updated: String
}
# The exact lat, lon location of the church
type Location {
	address: Address
  #latitude
  lat: Float!
  #longitude
  lon: Float!
}

type Address {
  #the address lines contain the actual street address 
  address_line_1: String!
  address_line_2: String!
  address_line_3: String
  country: String!
  city: String!
  state: String!
  #zip code in the us but it can be any postal code
  postal_code: Int!
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
  city: String!
  state: String!
  #zip code in the us but it can be any postal code
  postal_code: Int!
}

`;

export default () => [ GrpSchema, PaginationSchema ];

