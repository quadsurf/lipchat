

import gql from 'graphql-tag'

// LIP COLORS
const SubUserType = gql`
subscription SubUserType(
  $UserId: ID!
){
  User(
    filter: {
      mutation_in: [UPDATED]
      node: { id: $UserId }
    }
  ){
    node{
      id
      type
    }
  }
}`

export {
  SubUserType
}
