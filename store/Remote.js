

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { debounce } from 'underscore'
import { DotsLoader } from 'react-native-indicator'

// GQL
import {
  GetDistributorStatus,GetAdminChats,GetAllDistributorsStatusForShopper
} from '../api/db/queries'
import {
  SubToDistributorStatus,SubToDistributorsForShopper
} from '../api/db/pubsub'
import {
  AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr,UpdatePushToken
} from '../api/db/mutations'

// STORE
import {
  setSadvrId,updateDistributor,updateShoppersDistributor
} from '../store/actions'

// LOCALS
import { Views,Colors } from '../css/Styles'

// CONSTS
const debugging = __DEV__ && true
const duration = 3000

class Remote extends Component {

  constructor(props){
    super(props)
    this.addShopperToAppNotificationGroupChatInDb = debounce(
      this.addShopperToAppNotificationGroupChatInDb,
      duration,
      true
    )
    this.setSadvrId = debounce(this.setSadvrId,duration,true)
    this.createDmChatForShopperAndSadvrInDb = debounce(this.createDmChatForShopperAndSadvrInDb,duration,true)
    this.modifyShoppersDistributor = debounce(this.modifyShoppersDistributor,duration,true)
  }

  componentDidMount(){
    this.subToDistributorStatus()
    this.subToAllDistributorsStatusForShopper()
    setTimeout(()=>{
      this.props.navigation.navigate('Tabs')
    },2000)
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getAdminChats.allChats &&
      newProps.getAdminChats.allChats.length > 0
    ) {
      let adminChats = newProps.getAdminChats.allChats
      let { shopperId } = this.props
      let groupChat = adminChats.find( chat => {
        return chat.type === 'SADVR2ALL'
      })
      let dmChat = adminChats.find( chat => {
        return chat.type === 'DMU2ADMIN'
      })

      this.addShopperToAppNotificationGroupChatInDb(groupChat.id,shopperId)

      this.setSadvrId(groupChat.distributorsx[0].id)

      if (!dmChat) {
        debugging && console.log('no dmChat for Shopper and their distributor... therefore creating');
        this.createDmChatForShopperAndSadvrInDb(shopperId,groupChat.distributorsx[0].id)
      } else {
        debugging && console.log('dmChat for Shopper and their distributor exists');
      }
    }
  }

  addShopperToAppNotificationGroupChatInDb(chatId,shopperId){
    if (chatId && shopperId) {
      this.props.addShopperToAppNotificationGroupChat({
        variables: {chatId,shopperId}
      }).then( res => {
        if (res.data.addToChatOnShopper) {
          debugging && console.log('successfully added Shopper to App Notification Groupchat')
        } else {
          debugging && console.log('no response received from addShopperToAppNotificationGroupChat mutation')
        }
      }).catch( e => {
        debugging && console.log('addShopperToAppNotificationGroupChat in DB failed',e.message)
      })
    } else {
      debugging && console.log('insufficient inputs to run addShopperToAppNotificationGroupChat mutation');
    }
  }

  setSadvrId(sadvrId){
    this.props.setSadvrId(sadvrId)
  }

  createDmChatForShopperAndSadvrInDb(shopperId,distributorId){
    debugging && console.log('createDmChatForShopperAndDistributor func called');
    if (shopperId && distributorId) {
      this.props.createDmChatForShopperAndSadvr({
        variables: { shopperId,distributorId }
      }).then( res => {
        if (res.data.createChat) {
          debugging && console.log('received res from createDmChatForShopperAndDistributor mutation');
        } else {
          debugging && console.log('failed to receive res from createDmChatForShopperAndDistributor mutation');
        }
      }).catch( e => {
        debugging && console.log('failed to process createDmChatForShopperAndDistributor mutation',e.message);
      })
    } else {
      debugging && console.log('insufficient inputs to run createDmChatForShopperAndDistributor mutation');
    }
  }

  // transfer subscription to new chat preloader
  // add subscription to LipColors.js
  subToDistributorStatus(){
    let { distributorId } = this.props
    if (distributorId) {
      this.props.getDistributorStatus.subscribeToMore({
        document: SubToDistributorStatus,
        variables: { DistributorId: distributorId },
        updateQuery: (previous,{ subscriptionData }) => {
          let {
            mutation,
            node:{ status:nextStatus },
            previousValues:{ status:prevStatus }
          } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            if (nextStatus !== prevStatus) this.props.updateDistributor({status:nextStatus})
          }
        }
      })
    }
  }

  // add subscription to Likes.js
  // transfer subscription to new chat preloader
  subToAllDistributorsStatusForShopper(){
    let { shopperId } = this.props
    if (shopperId) {
      this.props.getAllDistributorsStatusForShopper.subscribeToMore({
        document: SubToDistributorsForShopper,
        variables: {
          ShopperId: { "id": shopperId }
        },
        updateQuery: (previous,{subscriptionData}) => {
          let { mutation } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            this.modifyShoppersDistributor(subscriptionData.data.Distributor.node)
          }
        }
      })
    }
  }

  modifyShoppersDistributor(dist){
    this.props.updateShoppersDistributor(dist)
  }

  render(){
    return (
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <DotsLoader
          size={15}
          color={Colors.blue}
          frequency={5000}/>
      </View>
    )
  }

}

Remote.propTypes = {
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  unreadCount: PropTypes.number
}

const mapStateToProps = state => ({
  shopperId: state.shopper.id,
  distributorId: state.distributor.id,
  unreadCount: state.unreadCount
})

const RemoteWithData = compose(
  graphql(GetDistributorStatus,{
    name: 'getDistributorStatus',
    options: props => ({
      variables: {
        DistributorId: props.distributorId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetAdminChats,{
    name: 'getAdminChats',
    options: props => ({
      variables: {
        shopperId: { "id": props.shopperId }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(AddShopperToAppNotificationGroupChat,{
    name: 'addShopperToAppNotificationGroupChat'
  }),
  graphql(CreateDmChatForShopperAndSadvr,{
    name: 'createDmChatForShopperAndSadvr'
  }),
  graphql(GetAllDistributorsStatusForShopper,{
    name: 'getAllDistributorsStatusForShopper',
    options: props => ({
      variables: {
        ShopperId: { id: props.shopperId }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(UpdatePushToken,{
    name: 'updatePushToken'
  })
)(Remote)

export default connect(mapStateToProps,{
  setSadvrId,updateDistributor,updateShoppersDistributor
})(RemoteWithData)
