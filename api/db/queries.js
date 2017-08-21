

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
    shopperx {
      id
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
  $distributorxId: ID,
  $shopperxId: ID
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

const GetDistributorId = gql`
query GetDistributorId(
  $userx: UserFilter!
){
  allDistributors(
    filter: {
      userx: $userx
    }
  ){
    id
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

export {
  GetUser,GetColorsAndInventories,GetDistributorId,GetUserType
}
