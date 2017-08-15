

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

const UpdateName = gql`
mutation UpdateName(
  $userId: ID!,
  $fbkFirstName: String!,
  $fbkLastName: String!
){
  updateUser(
    id: $userId,
    fbkFirstName: $fbkFirstName,
    fbkLastName: $fbkLastName
  ){
    fbkFirstName
    fbkLastName
  }
}`

const UpdateUserType = gql`
mutation UpdateUserType(
  $userId: ID!,
  $type: UserType!
){
  updateUser(
    id: $userId,
    type: $type
  ){
    type
  }
}`

const CreateDistributor = gql`
mutation CreateDistributor(
  $DistributorDistId: String!,
  $userxId: ID!
){
  createDistributor(
    distId: $DistributorDistId,
    userxId: $userxId
  ){
    id
    distId
  }
}`

const DeleteDistributor = gql`
mutation DeleteDistributor(
  $DistributorId: ID!
){
  deleteDistributor(
    id: $DistributorId
  ){
    id
  }
}`

const UpdateDistributorDistId = gql`
mutation UpdateDistributorDistId(
  $DistributorId: ID!,
  $DistributorDistId: String!
){
  updateDistributor(
    id: $DistributorId,
    distId: $DistributorDistId
  ){
    distId
  }
}`

const UpdateDistributorBizName = gql`
mutation UpdateDistributorBizName(
  $DistributorId: ID!,
  $DistributorBizName: String!
){
  updateDistributor(
    id: $DistributorId,
    bizName: $DistributorBizName
  ){
    bizName
  }
}`

const UpdateDistributorBizUri = gql`
mutation UpdateDistributorBizUri(
  $DistributorId: ID!,
  $DistributorBizUri: String!
){
  updateDistributor(
    id: $DistributorId,
    bizUri: $DistributorBizUri
  ){
    bizUri
  }
}`

const UpdateDistributorLogoUri = gql`
mutation UpdateDistributorLogoUri(
  $DistributorId: ID!,
  $DistributorLogoUri: String!
){
  updateDistributor(
    id: $DistributorId,
    logoUri: $DistributorLogoUri
  ){
    logoUri
  }
}`

const ConnectColorToDistributor = gql`
mutation ConnectColorToDistributor(
  $distributorxId: ID!,
  $colorxId: ID!,
  $count: Int!
){
  createInventory(
    distributorxId: $distributorxId,
    colorxId: $colorxId,
    count: $count
  ){
    id
    count
  }
}`

export {
  AuthenticateFacebookUser,UpdateFbkFriends,UpdateCellPhone,UpdateName,UpdateUserType,
  CreateDistributor,DeleteDistributor,
  UpdateDistributorDistId,UpdateDistributorBizName,UpdateDistributorBizUri,UpdateDistributorLogoUri,ConnectColorToDistributor
}
