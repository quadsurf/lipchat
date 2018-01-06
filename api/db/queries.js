

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
      status
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
          cellPhone
          fbkFirstName
          fbkLastName
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

const FindDistributor = `
query FindDistributor(
  $DistributorDistId: String
){
  allDistributors(
    filter: {
      distId: $DistributorDistId
    }
  ){
    id
    distId
    bizName
    bizUri
    logoUri
    status
    userx {
      fbkFirstName
      fbkLastName
      cellPhone
      fbkUserId
    }
    chatsx(
      filter: {
        type: GROUPINT
      }
    ){
      id
    }
  }
}`

const CheckForDistributorOnShopper = `
query(
  $ShopperId: ID
){
  Shopper(
    id: $ShopperId
  ){
    id
    distributorsx {
      id
      chatsx(
        filter: {
          type: GROUPINT
        }
      ){
        id
      }
    }
  }
}`

// CHAT SCREEN
const GetChatsForDistributor = gql`
query GetChatsForDistributor(
  $DistributorId: DistributorFilter!
){
  allChats(
    orderBy: updatedAt_ASC,
    filter: {
      OR: [
        {distributorsx_some: $DistributorId},
        {type: SADVR2ALL}
      ]
    }
  ){
    id
    alias
    updatedAt
    updater
    type
    shoppersx(
      last:1
    ){
      id
      userx {
        fbkFirstName
        fbkLastName
        fbkUserId
      }
    }
    distributorsx {
      id
      userx {
        fbkFirstName
        fbkLastName
        fbkUserId
      }
      logoUri
    }
    _messagesMeta {
      count
    }
    messages(
      last:1
    ){
      text
    }
  }
}`

const GetChatsForShopper = gql`
query GetChatsForShopper(
  $ShopperId: ShopperFilter!
){
  allChats(
    orderBy: updatedAt_ASC,
    filter: {
      shoppersx_some: $ShopperId
    }
  ){
    id
    alias
    updatedAt
    updater
    type
    shoppersx {
      id
    }
    distributorsx(
      first:1
    ){
      id
      userx {
        fbkFirstName
        fbkLastName
        fbkUserId
      }
      bizName
      logoUri
      status
    }
    _messagesMeta {
      count
    }
    messages(
      last:1
    ){
      text
    }
  }
}`

const GetDistributorStatus = gql`
query GetDistributorStatus(
  $DistributorId: ID!
){
  Distributor(
    id: $DistributorId
  ){
    status
    level
  }
}`

const GetAllDistributorsStatusForShopper = gql`
query GetDistributorsForShopper(
  $ShopperId: ShopperFilter!
){
  allDistributors(
    filter: {
      shoppersx_some: $ShopperId
    }
  ){
    id
    status
  }
}`

// not in use
const GetAllDistributorIdsForShopper = gql`
query GetAllDistributorIdsForShopper(
  $ShopperId: ShopperFilter!
){
  allChats(
    filter: {
      shoppersx_some: $ShopperId
    }
  ){
    id
    distributorsx{
      id
      status
    }
  }
}`

const GetMessagesForChat = gql`
query	GetMessagesForChat(
  $ChatId: ChatFilter!
){
  allMessages(
    orderBy: updatedAt_DESC,
    filter: {
      chat: $ChatId
    }
  ){
    id
    text
    writerx {
      id
      fbkUserId
      fbkFirstName
      fbkLastName
      type
      distributorx {
        id
        bizName
        logoUri
      }
    }
    updatedAt
  }
}`

const CheckIfDistributorHasGroupChat = `
query(
  $distributorsx: DistributorFilter!
){
  allChats(
    filter: {
      AND: [
        { distributorsx_some: $distributorsx },
        { type: GROUPINT }
      ]
    }
  ){
    id
    alias
  }
}`

const CheckIfShopperHasDmChatWithDistributor = `
query(
  $shoppersx: ShopperFilter
  $distributorsx: DistributorFilter
){
  allChats(
    filter: {
      AND: [
        { shoppersx_some: $shoppersx },
        { distributorsx_some: $distributorsx },
        { type: DMSH2DIST }
      ]
    }
  ){
    id
  }
}`

export {
  GetUser,GetColorsAndInventories,GetUserType,GetDistributor,FindDistributor,CheckForDistributorOnShopper,GetChatsForShopper,GetChatsForDistributor,GetDistributorStatus,GetAllDistributorsStatusForShopper,GetMessagesForChat,CheckIfDistributorHasGroupChat,CheckIfShopperHasDmChatWithDistributor
}
