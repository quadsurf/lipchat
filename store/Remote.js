

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { debounce } from 'underscore'
import { DotsLoader } from 'react-native-indicator'
import PropTypes from 'prop-types'

// GQL
import {
  GetColorsAndInventories,GetAdminChats,GetChatsForShopper,GetChatsForDistributor
} from '../api/db/queries'
import {
  AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr
} from '../api/db/mutations'
import {
  SubToShoppersChats,SubToDistributorsChats
} from '../api/db/pubsub'

// STORE
import { setColors,setSadvrId } from './actions'
import {
  setChats,
  addChat,
  updateChat,
  removeChat
} from '../screens/Chat/store/actions'

// LOCALs
import { Views,Colors } from '../css/Styles'

// COMPs
import Loading from '../screens/common/Loading'

// CONSTs
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
    this.setChats = debounce(this.setChats,1000,true)
    this.removeChatFromChatList = debounce(this.removeChatFromChatList,1000,true)
  }

  state = {
    isFocused: false,
    setShprChatsCount: 0,
    setDistChatsCount: 0,
    whichPhone: 'neither'
  }

  componentWillMount(){
    if (this.props.userId === 'cjc7eqiegegll0181qwvaw3yb') {
      this.setState({ whichPhone:'shpr' })
    }
    if (this.props.userId === 'cjc7e6hbkecj101408yeexye6') {
      this.setState({ whichPhone:'dist' })
    }
    if (this.props.userId === 'cjc7dasmue8o90128jkpzeqhe') {
      this.setState({ whichPhone:'admin' })
    }
  }

  // componentWillMount(){
  //   this.didFocusSubscription = this.props.navigation.addListener(
  //     'didFocus',
  //     ({ action:{ key } }) => {
  //       if (key !== 'StackRouterRoot' && !this.state.isFocused) this.setState({isFocused:true})
  //       //debugging &&
  //       console.log('didFocus on Chat:',key)
  //     }
  //   )
  //   this.didBlurSubscription = this.props.navigation.addListener(
  //     'didBlur',
  //     ({ action:{ key } }) => {
  //       key !== 'StackRouterRoot' && this.setState({isFocused:false})
  //       //debugging &&
  //       console.log('didBlur on Chat:',key)
  //     }
  //   )
  // }
  //
  // componentWillUnmount(){
  //   this.didFocusSubscription.remove()
  //   this.didBlurSubscription.remove()
  // }

  componentDidMount(){
    setTimeout(()=>{
      this.props.navigation.navigate('Tabs')
    },2000)
    this.subToShoppersChats()
    this.subToDistributorsChats()
    // this.subToAdminChats()
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getAdminChats.allChats &&
      newProps.getAdminChats.allChats.length > 0
    ) {
      let adminChats = newProps.getAdminChats.allChats
      let { shopperId } = this.props
      let groupChat = adminChats.find( chat => chat.type === 'SADVR2ALL' )
      let dmChat = adminChats.find( chat => chat.type === 'DMU2ADMIN' )

      this.addShopperToAppNotificationGroupChatInDb(groupChat.id,shopperId)

      let distributorId = groupChat.distributorsx[0].id

      this.setSadvrId(distributorId)

      if (!dmChat) {
        this.createDmChatForShopperAndSadvrInDb(shopperId,distributorId)
        debugging && console.log('no dmChat for Shopper and their distributor... therefore creating')
      } else {
        debugging && console.log('dmChat for Shopper and their distributor exists')
      }
    }

    if (
      newProps.getColorsAndInventories &&
      newProps.getColorsAndInventories.allColors &&
      newProps.getColorsAndInventories.allColors.length > 0
    ) {
      this.props.setColors(newProps.getColorsAndInventories.allColors)
    }

    if (
      newProps.getChatsForDistributor &&
      newProps.getChatsForDistributor.allChats &&
      newProps.getChatsForDistributor.allChats !== this.props.getChatsForDistributor.allChats
    ) {
      if (this.props.userType === 'DIST' || this.props.userType === 'SADVR') {
        this.setState({ setShprChatsCount: ++this.state.setShprChatsCount },()=>{
          if (this.state.setShprChatsCount < 2) {
            this.setChats(newProps.getChatsForDistributor.allChats)
          }
        })
      }
    }

    if (
      newProps.getChatsForShopper &&
      newProps.getChatsForShopper.allChats &&
      newProps.getChatsForShopper.allChats !== this.props.getChatsForShopper.allChats
    ) {
      if (this.props.userType === 'SHOPPER') {
        this.setState({ setDistChatsCount: ++this.state.setDistChatsCount },()=>{
          if (this.state.setDistChatsCount < 2) {
            this.setChats(newProps.getChatsForShopper.allChats)
          }
        })
      }
    }

  }

  setChats(chats){
    this.props.setChats(chats)
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
      debugging && console.log('insufficient inputs to run addShopperToAppNotificationGroupChat mutation')
    }
  }

  setSadvrId(sadvrId){
    this.props.setSadvrId(sadvrId)
  }

  createDmChatForShopperAndSadvrInDb(shopperId,distributorId){
    debugging && console.log('createDmChatForShopperAndDistributor func called')
    if (shopperId && distributorId) {
      this.props.createDmChatForShopperAndSadvr({
        variables: { shopperId,distributorId }
      }).then( res => {
        if (res.data.createChat) {
          debugging && console.log('received res from createDmChatForShopperAndDistributor mutation')
        } else {
          debugging && console.log('failed to receive res from createDmChatForShopperAndDistributor mutation')
        }
      }).catch( e => {
        debugging && console.log('failed to process createDmChatForShopperAndDistributor mutation',e.message)
      })
    } else {
      debugging && console.log('insufficient inputs to run createDmChatForShopperAndDistributor mutation')
    }
  }

  subToShoppersChats(){
    let { shopperId } = this.props
    if (shopperId) {
      this.props.getChatsForShopper.subscribeToMore({
        document: SubToShoppersChats,
        variables: {ShopperId:{"id":shopperId}},
        updateQuery: (previous, { subscriptionData }) => {
          let { mutation,node,previousValues } = subscriptionData.data.Chat
          switch(mutation){
            case 'CREATED': this.addChatToChatList(node,'subToShoppersChats')
            case 'UPDATED': this.preQualifyChatUpdate(previousValues,node);
            // case 'DELETED': this.removeChatFromChatList(previousValues.id,'subToShoppersChats')
            default: return
          }
        },
        onError: e => {
          this.openError('retrieving new real-time chats')
          debugging && console.log('subToShoppersChats error:',e.message)
        }
      })
    }
  }

  addChatToChatList(chat,cameFrom){
    this.props.addChat(chat)
  }

  preQualifyChatUpdate(prevChat,nextChat){
    let { chats,userType,shopperId } = this.props
    let selectedChat = chats.find( chat => chat.id === nextChat.id)
    if (!selectedChat) {
      this.addChatToChatList(nextChat,'updateChatOnChatList with no selectedChat')
    } else {
      if (prevChat.hasOwnProperty('id') && nextChat.hasOwnProperty('id')) {
        if (nextChat.type === 'DIST2SHPRS') {
          if (userType === 'SHOPPER') {
            let shopperExists = selectedChat.shoppersx.find( shopper => shopper.id === shopperId)
            if (!shopperExists) {
              this.removeChatFromChatList(prevChat.id)
            } else {
              this.updateChat(nextChat,'updateChatOnChatList, shopper does exist')
            }
            debugging && console.log('shopperExists',shopperExists)
          } else {
            this.updateChat(nextChat,'updateChatOnChatList, userType is not a shopper')
          }
        } else if (nextChat.type === 'SADVR2ALL') {
            this.throttleUpdateChat(nextChat,'updateChatOnChatList with selectedChat (SADVR2ALL)')
        } else if (prevChat.updater !== nextChat.updater) {
          this.throttleUpdateChat(nextChat,'updateChatOnChatList with selectedChat (updater is diff)')
        }
      } else {
        debugging && console.log('no prevChat value')
      }
      debugging && console.log('selectedChat on updateChatOnChatList func',selectedChat.id)
    }
    debugging && console.log('updateChatOnChatList func called')
  }

  throttleUpdateChat(nextChat,scenario){
    nextChat.hasOwnProperty('shoppersx')
    && nextChat.shoppersx.length > 0
    && nextChat.shoppersx[0].hasOwnProperty('userx')
    && this.updateChat(nextChat,scenario)
  }

  qualifyAudience(audience){
    let { userType,distributorStatus } = this.props
    if (audience === 'ANY') {
      return true
    }
    if (audience === 'SHOPPERS') {
      let canView = userType === 'SHOPPER' ? true : false
      return canView
    }
    if (audience === 'APPROVED') {
      let canView = userType === 'DIST' && distributorStatus ? true : false
      return canView
    }
    if (audience === 'PENDINGS') {
      let canView = userType === 'DIST' && !distributorStatus ? true : false
      return canView
    }
    if (audience === 'SHPSDSTS') {
      return true
    }
    if (audience === 'SHPSAPPS') {
      let canView = userType === 'DIST' && distributorStatus ? true : userType === 'SHOPPER' ? true : false
      return canView
    }
    if (audience === 'SHPSPNDS') {
      let canView = userType === 'DIST' && !distributorStatus ? true : userType === 'SHOPPER' ? true : false
      return canView
    }
    if (audience === 'APPSPNDS') {
      let canView = userType === 'DIST' ? true : false
      return canView
    }
    return false
  }

  updateChat(chat,scenario){
    let isSelf,hasMessage,canViewIt
    let { userId,updateChat,userType,distributorStatus } = this.props
    // let { isFocused } = this.state
    if (chat.messages.length > 0) {
      let msg = chat.messages[0]
      if (msg.writerx.id === userId) {
        isSelf = true
      } else {
        isSelf = false
      }
      if (msg.text === 'isTypingNow') {
        hasMessage = false
      } else {
        hasMessage = true
      }
      let canView = this.qualifyAudience(msg.audience)
      canViewIt = userType === 'SADVR' ? true : canView
      canViewIt && updateChat(chat,isSelf,hasMessage)
    } else {
      // isSelf = true
      // hasMessage = false
      // updateChat(chat,isSelf,hasMessage)
    }
  }

  removeChatFromChatList(chatId,cameFrom){
    chatId && this.props.removeChat(chatId)
    debugging && console.log('removeChatFromChatList func called',`${cameFrom}-${chatId}`)
  }

  subToDistributorsChats(){
    let { shopperId,distributorId } = this.props
    if (distributorId) {
      this.props.getChatsForDistributor.subscribeToMore({
        document: SubToDistributorsChats,
        variables: {
          DistributorId:{"id":distributorId},
          shopperId:{"id":shopperId}
        },
        updateQuery: (previous, { subscriptionData }) => {
          let { mutation,node,previousValues } = subscriptionData.data.Chat
          switch(mutation){
            case 'CREATED': this.addChatToChatList(node,'subToDistributorsChats')
            case 'UPDATED': this.preQualifyChatUpdate(previousValues,node);
            // case 'DELETED': this.removeChatFromChatList(previousValues.id,'subToDistributorsChats')
            default: return
          }
        },
        onError: e => {
          this.openError('retrieving new real-time chats')
          debugging && console.log('subToDistributorsChats error:',e.message)
        }
      })
    }
  }

  render(){
    return <Loading/>
  }

}

Remote.propTypes = {
  chats: PropTypes.array.isRequired,
  userType: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  distributorStatus: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  unreadCount: PropTypes.number
}

const mapStateToProps = state => ({
  chats: state.chats,
  userType: state.user.type,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id,
  distributorStatus: state.distributor.status,
  userId: state.user.id,
  unreadCount: state.unreadCount
})

const RemoteWithData = compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.distributorId,
        shopperxId: props.shopperId
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
  graphql(GetChatsForDistributor,{
    name: 'getChatsForDistributor',
    options: props => ({
      variables: {
        DistributorId: { id: props.distributorId },
        shopperId: { id: props.shopperId }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetChatsForShopper,{
    name: 'getChatsForShopper',
    options: props => ({
      variables: { ShopperId: { id: props.shopperId } },
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

export default connect(mapStateToProps,{
  setColors,setSadvrId,setChats,addChat,updateChat,removeChat
})(RemoteWithData)
