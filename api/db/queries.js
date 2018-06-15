

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
      level
      distId
      bizName
      bizUri
      logoUri
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
        level
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
  allColors(
    filter: {
      status_not: DISCONTINUED
    }
  ){
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
        type: DIST2SHPRS
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
          type: DIST2SHPRS
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
  $shopperId: ShopperFilter!
){
  allChats(
    orderBy: updatedAt_ASC,
    filter: {
      OR: [
        {distributorsx_some: $DistributorId},
        {type: SADVR2ALL},
        { AND: [
          {shoppersx_some: $shopperId},
          {type: DMU2ADMIN}
        ] }
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
        cellPhone
      }
    }
    distributorsx {
      id
      userx {
        fbkFirstName
        fbkLastName
        fbkUserId
        cellPhone
      }
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
      updatedAt
      writerx {
        id
      }
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
        cellPhone
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
      updatedAt
      writerx {
        id
      }
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
    id
    status
    level
  }
}`

const GetAllDistributorsStatusForShopper = gql`
query(
  $ShopperId: ShopperFilter!
){
  allDistributors(
    filter: {
      shoppersx_some: $ShopperId
    }
  ){
    id
    bizName
    bizUri
    distId
    logoUri
    status
    level
    userx {
      fbkUserId
      cellPhone
      fbkFirstName
      fbkLastName
    }
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
query(
  $ChatId: ChatFilter!
  $chatCount: Int!
  $skipCount: Int!
  $aud1: Audience
  $aud2: Audience
  $aud3: Audience
  $aud4: Audience
  $aud5: Audience
  $aud6: Audience
  $aud7: Audience
){
  allMessages(
    orderBy: updatedAt_DESC
    filter: {
      chat: $ChatId
      AND: [
        {
          OR: [
            { audience: $aud1 },
            { audience: $aud2 },
            { audience: $aud3 },
            { audience: $aud4 },
            { audience: $aud5 },
            { audience: $aud6 },
            { audience: $aud7 },
            { audience: ANY }
          ]
        }
      ]
    },
    first: $chatCount
    skip: $skipCount
  ){
    id
    text
    audience
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
        { type: DIST2SHPRS }
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
  $type: ChatType!
){
  allChats(
    filter: {
      AND: [
        { shoppersx_some: $shoppersx },
        { distributorsx_some: $distributorsx },
        { type: $type  }
      ]
    }
  ){
    id
    distributorsx {
      bizName
      userx {
        fbkFirstName
        fbkLastName
      }
    }
  }
}`

const GetShoppersDistributor = gql`
query(
  $shopperId: ID!
){
  Shopper(
    id: $shopperId
  ){
    id
    distributorsx {
      id
      status
    }
  }
}`

const GetAdminChats = gql`
query(
  $shopperId: ShopperFilter!
){
  allChats(
    filter: {
      OR: [
        { type: SADVR2ALL },
        { AND: [
          { type: DMU2ADMIN },
          { shoppersx_some: $shopperId }
        ] }
      ]
    }
  ){
    id
    type
    distributorsx {
      id
    }
  }
}`

const GetLikesForShopper = gql`
query(
  $shopperId: ShopperFilter!
){
  allLikes(
    filter: {
      AND: [
        { shopperx: $shopperId },
        { doesLike: true }
      ]
    }
  ){
    id
    doesLike
    colorx {
      id
      name
      rgb
      status
      tone
      finish
    }
  }
}`

export {
  GetUser,GetColorsAndInventories,GetUserType,GetDistributor,FindDistributor,CheckForDistributorOnShopper,GetChatsForShopper,GetChatsForDistributor,GetDistributorStatus,GetAllDistributorsStatusForShopper,GetMessagesForChat,CheckIfDistributorHasGroupChat,GetShoppersDistributor,CheckIfShopperHasDmChatWithDistributor,GetAdminChats,GetLikesForShopper
}
