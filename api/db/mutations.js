

import gql from 'graphql-tag'

// LOGIN
const AuthenticateFacebookUser = gql`
mutation AuthenticateFacebookUser(
  $fbkUser: String!
){
  authenticateFacebookUser(
    fbkUser: $fbkUser
  ) {
    token
  }
}`

// LOGIN
const UpdateFbkFriends = gql`
mutation UpdateFbkFriends(
  $userId: ID!,
  $fbkFriends: Json!
){
  updateUser(
    id: $userId,
    fbkFriends: $fbkFriends
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
  }
}`

// YOU TAB
const UpdateCellPhone = gql`
mutation UpdateCellPhone(
  $userId: ID!,
  $cellPhone: String!
){
  updateUser(
    id: $userId,
    cellPhone: $cellPhone
  ){
    cellPhone
  }
}`

export {
  AuthenticateFacebookUser,UpdateFbkFriends,UpdateCellPhone
}
