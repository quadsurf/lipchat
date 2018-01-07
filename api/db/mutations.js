

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

const LinkShopperToDistributor = gql`
mutation LinkShopperToDistributor(
  $ShopperId: ID!,
  $DistributorId: ID!
){
  addToShopperOnDistributor(
    shoppersxShopperId: $ShopperId,
    distributorsxDistributorId: $DistributorId
  ){
    shoppersxShopper {
      id
    }
    distributorsxDistributor {
      id
    }
  }
}`

const DeLinkShopperFromDistributor = gql`
mutation DisconnectShopperFromDistributor(
  $ShopperId: ID!,
  $DistributorId: ID!
){
  removeFromShopperOnDistributor(
    shoppersxShopperId: $ShopperId,
    distributorsxDistributorId: $DistributorId
  ){
    shoppersxShopper {
      id
    }
    distributorsxDistributor {
      id
    }
  }
}`

// LIP COLORS TAB
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

const UpdateCountOnInventory = gql`
mutation UpdateInventory(
  $InventoryId: ID!,
  $InventoryCount: Int!
){
  updateInventory(
    id: $InventoryId,
    count: $InventoryCount
  ){
    id
    count
  }
}`

const CreateLike = gql`
mutation CreateLike(
  $ShopperId: ID!,
  $ColorId: ID!
){
  createLike(
    shopperxId: $ShopperId,
    colorxId: $ColorId
  ){
    id
    doesLike
  }
}`

const UpdateDoesLikeOnLike = gql`
mutation UpdateDoesLikeOnLike(
  $LikeId: ID!,
  $bool: Boolean!
){
  updateLike(
    id: $LikeId,
    doesLike: $bool
  ){
    id
    doesLike
  }
}`

const CreateChatMessage = gql`
mutation CreateMessage(
  $ChatId: ID!,
  $text: String!,
  $writer: ID!
){
  createMessage(
    chatId: $ChatId,
    text: $text,
    writerxId: $writer
  ){
    id
    text
    updatedAt
  }
}`

const UpdateChatMessage = gql`
mutation UpdateChatMessage(
  $MessageId: ID!,
  $text: String!
){
  updateMessage(
    id: $MessageId,
    text: $text
  ){
    id
  }
}`

const DeleteChatMessage = gql`
mutation DeleteChatMessage(
  $MessageId: ID!
){
  deleteMessage(
    id: $MessageId
  ){
    id
  }
}`

const AddShopperToDistributorsGroupChat = gql`
mutation AddShopperToDistributorsGroupChat(
  $chatsxChatId: ID!
  $shoppersxShopperId: ID!
){
  addToChatOnShopper(
    chatsxChatId: $chatsxChatId,
    shoppersxShopperId: $shoppersxShopperId
  ){
    chatsxChat {
      alias
    }
  }
}`

const RemoveShopperFromDistributorsGroupChat = gql`
mutation(
  $shopperId: ID!,
  $chatId: ID!
){
  removeFromChatOnShopper(
    shoppersxShopperId: $shopperId,
    chatsxChatId: $chatId
  ){
    shoppersxShopper {
      id
    }
    chatsxChat {
      id
    }
  }
}`

const TriggerEventOnChat = gql`
mutation(
  $chatId: ID!
  $updater: String!
){
  updateChat(
    id: $chatId
    updater: $updater
  ){
    id
  }
}`

const CreateGroupChatForDistributor = gql`
mutation(
  $alias: String!
  $distributorsx: [ID!]
){
  createChat(
    alias: $alias
    distributorsxIds: $distributorsx
    type: GROUPINT
  ){
    id
  }
}`

const CreateDmChatForShopperAndDistributor = `
mutation(
  $shoppersx: [ID!]
  $distributorsx: [ID!]
){
  createChat(
    shoppersxIds: $shoppersx
    distributorsxIds: $distributorsx
    type: DMSH2DIST
  ){
    id
  }
}`

const AddShopperToAppNotificationGroupChat = gql`
mutation(
  $chatId: ID!
  $shopperId: ID!
){
  addToChatOnShopper(
    chatsxChatId: $chatId,
    shoppersxShopperId: $shopperId
  ){
    chatsxChat {
      shoppersx {
        id
      }
    }
  }
}`

export {
  AuthenticateFacebookUser,UpdateFbkFriends,UpdateCellPhone,UpdateName,UpdateUserType,
  UpdateDistributorDistId,UpdateDistributorBizName,UpdateDistributorBizUri,UpdateDistributorLogoUri,ConnectColorToDistributor,UpdateCountOnInventory,CreateLike,UpdateDoesLikeOnLike,LinkShopperToDistributor,DeLinkShopperFromDistributor,CreateChatMessage,UpdateChatMessage,DeleteChatMessage,AddShopperToDistributorsGroupChat,RemoveShopperFromDistributorsGroupChat,TriggerEventOnChat,CreateGroupChatForDistributor,CreateDmChatForShopperAndDistributor,AddShopperToAppNotificationGroupChat
}
