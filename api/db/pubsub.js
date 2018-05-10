

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
    mutation
    previousValues {
      type
    }
    node {
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
        updatedAt
        writerx {
          id
        }
      }
    }
  }
}`

const SubToDistributorsChats = gql`
subscription(
  $DistributorId: DistributorFilter!
  $shopperId: ShopperFilter!
){
  Chat(
    filter: {
      mutation_in: [UPDATED]
      OR: [
        {
          node: {
        		distributorsx_some: $DistributorId
      		}
        },
        {
          node: {
        		type: SADVR2ALL
      		}
        },
        {
          AND: [
            {
              node: {
                shoppersx_some: $shopperId
              }
            },
            {
              node: {
                type: DMU2ADMIN
              }
            }
          ]
        }
      ]
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
    mutation
    previousValues {
      status
    }
    node {
      id
      status
      level
    }
  }
}`

const SubToDistributorsForShopper = gql`
subscription(
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
    mutation
    node {
      id
    	status
      bizName
      bizUri
      logoUri
    }
  }
}`

const SubToChatsMessages = gql`
subscription SubToChatsMessages(
  $ChatId: ChatFilter!
  $aud1: Audience
  $aud2: Audience
  $aud3: Audience
  $aud4: Audience
  $aud5: Audience
  $aud6: Audience
  $aud7: Audience
){
  Message(
    filter: {
      mutation_in: [CREATED,UPDATED,DELETED]
      AND: [
        {
          node: {
            chat: $ChatId
          }
        },
        {
          OR: [
            { node: {audience: $aud1} },
            { node: {audience: $aud2} },
            { node: {audience: $aud3} },
            { node: {audience: $aud4} },
            { node: {audience: $aud5} },
            { node: {audience: $aud6} },
            { node: {audience: $aud7} },
            { node: {audience: ANY} }
          ]
        }
      ]
    }
  ){
    mutation
    previousValues {
      id
    }
    node {
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
  }
}`

const SubToLikesForShopper = gql`
subscription(
  $shopperId: ShopperFilter!
){
  Like(
    filter: {
      mutation_in: [CREATED,UPDATED]
      node: {
        shopperx: $shopperId
      }
    }
  ){
    mutation
    previousValues {
      id
      doesLike
    }
    node {
      id
      doesLike
      colorx {
        id
        name
        rgb
        status
        tone
        finish
        family
      }
    }
  }
}`

export {
  SubToUserType,SubToShoppersChats,SubToDistributorsChats,SubToDistributorStatus,SubToDistributorsForShopper,SubToChatsMessages,SubToLikesForShopper
}
