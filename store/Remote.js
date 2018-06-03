

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { debounce } from 'underscore'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetAdminChats } from '../api/db/queries'
import {
  AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr
} from '../api/db/mutations'

// STORE
import { setSadvrId } from '../store/actions'

// LOCALS
import { Views,Colors } from '../css/Styles'

// CONSTS
const debugging = __DEV__ && false
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
  }

  componentDidMount(){
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

      let distributorId = groupChat.distributorsx[0].id

      this.setSadvrId(distributorId)

      if (!dmChat) {
        debugging && console.log('no dmChat for Shopper and their distributor... therefore creating');
        this.createDmChatForShopperAndSadvrInDb(shopperId,distributorId)
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
  unreadCount: PropTypes.number
}

const mapStateToProps = state => ({
  shopperId: state.shopper.id,
  unreadCount: state.unreadCount
})

const RemoteWithData = compose(
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
  })
  // graphql(UpdatePushToken,{
  //   name: 'updatePushToken'
  // })
)(Remote)

export default connect(mapStateToProps,{ setSadvrId })(RemoteWithData)
