

export const schema = [`
# A church object stored in MongoDB
type Parroquia {
  name: String!
  address: Address!   
  location: Location
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

# The exact lat, lon location of the church
type Location {
  #latitude
  lat: Float!
  #longitude
  lon: Float!
}
`];
