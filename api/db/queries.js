

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
    }
    shopperx {
      id
      distributorsx {
        id
        bizName
        bizUri
        distId
        logoUri
        status
        userx {
          fbkUserId
        }
      }
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

const GetColorsAndInventories = gql`
query GetColorsAndInventories(
  $distributorxId: ID!,
  $shopperxId: ID!
){
  allColors{
    id
    family
    finish
    name
    rgb
    status
    tone
    inventoriesx(
      filter: {
        distributorx: {
          id: $distributorxId
        }
      }
    ){
      id
      count
    }
    likesx(
      filter: {
        shopperx: {
          id: $shopperxId
        }
      }
    ){
      id
      doesLike
    }
  }
}`

const GetUserType = gql`
query GetUserType(
  $UserId: ID
){
  User(
    id: $UserId
  ){
    id
    type
  }
}`

const GetDistributor = gql`
query GetDistributor(
  $DistributorId: ID
){
  Distributor(
    id: $DistributorId
  ){
    distId
    bizName
    bizUri
    logoUri
  }
}`

export {
  GetUser,GetColorsAndInventories,GetUserType,GetDistributor
}
