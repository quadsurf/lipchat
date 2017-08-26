

import gql from 'graphql-tag'

// LIP COLORS
const SubUserType = gql`
subscription SubUserType{
  User(
    filter: {
      mutation_in: [UPDATED]
    }
  ){
    node {
      id
      type
    }
  }
}`

export {
  SubUserType
}
