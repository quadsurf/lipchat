

import gql from 'graphql-tag'

const GetUser = gql`
query GetUser(
  $userId: ID!
){
  User(
    id: $userId
  ){
    id
    cellPhone
    fbkAgeMax
    fbkAgeMin
    fbkEmail
    fbkFirstName
    fbkFriends
    fbkGender
    fbkLastName
    fbkPhotoUri
    fbkUserId
    fbkVerified
    type
    distributorx {
      id
      distId
      bizName
      bizUri
      logoUri
    }
  }
}`

const GetColors = gql`
query GetColors{
  allColors{
    id
    family
    finish
    name
    rgb
    status
    tone
  }
}`

export {
  GetUser,GetColors
}
