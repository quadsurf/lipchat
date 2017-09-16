

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

// CHAT
const SubShoppersChats = gql`
subscription SubShoppersChats(
  $ShopperId: ShopperFilter!
){
  Chat(
    filter: {
      mutation_in: [CREATED,UPDATED]
      node: {
        shoppersx_every: $ShopperId
      }
    }
  ){
    node {
      id
      alias
      updatedAt
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

const SubDistributorsChats = gql`
subscription SubDistributorsChats(
  $DistributorId: DistributorFilter!
){
  Chat(
    filter: {
      mutation_in: [CREATED,UPDATED]
      node: {
        distributorsx_every: $DistributorId
      }
    }
  ){
    node {
      id
      alias
      updatedAt
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

export {
  SubUserType,SubShoppersChats,SubDistributorsChats,SubToDistributorStatus,SubToDistributorsForShopper
}
