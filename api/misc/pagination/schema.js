
const PaginationSchema = `

  type Pagination {
    page: Int!
    size: Int!
    pages: Int!
  }

  input PaginationI {
    page: Int!  
    size: Int!
  }
`;

export default () => [ PaginationSchema ];
