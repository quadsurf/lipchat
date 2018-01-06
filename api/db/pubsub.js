

import gql from 'graphql-tag'

// LIP COLORS
const SubToUserType = gql`
subscription SubToUserType(
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

// CHAT
const SubToShoppersChats = gql`
subscription SubToShoppersChats(
  $ShopperId: ShopperFilter!
){
  Chat(
    filter: {
      mutation_in: [CREATED,UPDATED,DELETED]
      node: {
        shoppersx_some: $ShopperId
      }
    }
  ){
    mutation
    previousValues {
      id
      updater
    }
    node {
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
  }
}`

const SubToDistributorsChats = gql`
subscription SubToDistributorsChats(
  $DistributorId: DistributorFilter!
){
  Chat(
    filter: {
      mutation_in: [CREATED,UPDATED]
      node: {
        distributorsx_some: $DistributorId
      }
    }
  ){
    node {
      id
      alias
      updatedAt
      updater
      type
      shoppersx(
        first:1
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
  }
}`

const SubToDistributorStatus = gql`
subscription SubToDistributorStatus(
  $DistributorId: ID!
){
  Distributor(
    filter: {
      mutation_in: [UPDATED],
      node: {
        id: $DistributorId
      }
    }
  ){
    node {
      id
      status
      level
    }
  }
}`

const SubToDistributorsForShopper = gql`
subscription SubToDistributorsForShopper(
  $ShopperId: ShopperFilter!
){
  Distributor(
    filter: {
      mutation_in: [UPDATED],
      node: {
        shoppersx_some: $ShopperId
      }
    }
  ){
    node {
      id
    	status
    }
  }
}`

const SubToChatsMessages = gql`
subscription SubToChatsMessages(
  $ChatId: ChatFilter!
){
  Message(
    filter: {
      mutation_in: [CREATED,UPDATED,DELETED]
      node: {
        chat: $ChatId
      }
    }
  ){
    mutation
    previousValues {
      id
    }
    node {
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
  }
}`

export {
  SubToUserType,SubToShoppersChats,SubToDistributorsChats,SubToDistributorStatus,SubToDistributorsForShopper,SubToChatsMessages
}
