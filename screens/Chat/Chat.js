

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'

// STORE
import { connect } from 'react-redux'
import {
  setChats,
  markUnread,
  markRead,
  incrementUnreadCount,
  decrementUnreadCount
} from './store/actions'

// GQL
import {
  GetChatsForShopper,GetChatsForDistributor
} from '../../api/db/queries'
import {
  SubToShoppersChats,SubToDistributorsChats
} from '../../api/db/pubsub'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs
const debugging = false

// COMPONENTS
import ChatCard from './ChatCard'

class Chat extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user ? this.props.user : null,
    userType: this.props.userType ? this.props.userType : null,
    chats: null,
    // expectedChatId: null
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getChatsForDistributor && 
      newProps.getChatsForDistributor.allChats && 
      newProps.getChatsForDistributor.allChats !== this.props.getChatsForDistributor.allChats
    ) {
      if (this.props.userType === 'DIST' && this.state.chats === null) {
        this.props.setChats(newProps.getChatsForDistributor.allChats)
      }
    }
    if (
      newProps.getChatsForShopper && 
      newProps.getChatsForShopper.allChats && 
      newProps.getChatsForShopper.allChats !== this.props.getChatsForShopper.allChats
    ) {
      if (this.props.userType === 'SHOPPER' && this.state.chats === null) {
        this.props.setChats(newProps.getChatsForShopper.allChats)
      }
    }
    if (
      newProps.chats && 
      newProps.chats.length > 0
    ) {
      setTimeout(()=>{
        this.setState({chats:newProps.chats})
      },1000)
      debugging && console.log('new chats',newProps.chats[0])
    }
    if (newProps.unreadCount) {
      console.log('unreadCount',newProps.unreadCount)
    }
  }
  
  setChats(allChats){
    let chats = JSON.parse(JSON.stringify(allChats))
    chats.sort( (a,b) => Date.parse(b.messages[0].updatedAt) - Date.parse(a.messages[0].updatedAt))
    this.setState({chats})
  }
  
  componentDidMount(){
    this.subToShoppersChats()
    this.subToDistributorsChats()
  }

  subToShoppersChats(){
    if (this.props.user && this.props.user.shopperx && this.props.user.shopperx.id) {
      this.props.getChatsForShopper.subscribeToMore({
        document: SubToShoppersChats,
        variables: {ShopperId:{"id":this.props.user.shopperx.id}},
        updateQuery: (previous, { subscriptionData }) => {
          let { mutation,node,previousValues } = subscriptionData.data.Chat
          switch(mutation){
            case 'CREATED': this.addChatToChatList(node,'subToShoppersChats')
            case 'UPDATED': this.updateChatOnChatList(previousValues,node)
            case 'DELETED': this.removeChatFromChatList(previousValues,'subToShoppersChats')
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
    let isSelf
    if (chat.messages.length > 0 && chat.messages[0].writerx.id === this.props.user.id) {
      isSelf = true
    } else {
      isSelf = false
    }
    this.props.markUnread(chat,isSelf)
    debugging && console.log('addChatToChatList func called')
    debugging && console.log('Came From: ',cameFrom)
  }
  
  updateChatOnChatList(prevChat,nextChat){
    let subjectChat = this.state.chats.find( chat => {
      return chat.id === nextChat.id
    })
    if (!subjectChat) {
      this.addChatToChatList(nextChat,'updateChatOnChatList with no subjectChat')
    } else {
      if (prevChat && nextChat) {
        if (nextChat.type === 'DIST2SHPRS') {
          if (this.props.userType === 'SHOPPER') {
            let shopperExists = subjectChat.shoppersx.find( shopper => {
              return shopper.id === this.props.user.shopperx.id
            })
            if (!shopperExists) {
              this.removeChatFromChatList(prevChat,'updateChatOnChatList')
            } else {
              this.addChatToChatList(nextChat,'updateChatOnChatList, shopper does exist')
            }
            debugging && console.log('shopperExists',shopperExists)
          } else {
            this.addChatToChatList(nextChat,'updateChatOnChatList, userType is not a shopper')
          }
        } else if (nextChat.type === 'SADVR2ALL') {
            this.addChatToChatList(nextChat,'updateChatOnChatList with subjectChat (SADVR2ALL)')
        } else if (prevChat.updater !== nextChat.updater) {
          this.addChatToChatList(nextChat,'updateChatOnChatList with subjectChat (updater is diff)')
        }
      } else {
        debugging && console.log('no prevChat value')
      }
    }
    debugging && console.log('updateChatOnChatList func called')
    debugging && console.log('subjectChat on updateChatOnChatList func',subjectChat.id)
  }
  
  removeChatFromChatList(prevChat,cameFrom){
    if (cameFrom === 'updateChatOnChatList' && prevChat && prevChat.id) {
      let chats = JSON.parse(JSON.stringify(this.state.chats))
      let i = chats.findIndex( chat => {
        return chat.id === prevChat.id
      })
      if (i !== -1) {
        chats.splice(i,1)
        this.setState({chats})
      }
    }
    debugging && console.log('removeChatFromChatList func called',cameFrom)
  }

  subToDistributorsChats(){
    if (this.props.user && this.props.user.distributorx && this.props.user.distributorx.id) {
      this.props.getChatsForDistributor.subscribeToMore({
        document: SubToDistributorsChats,
        variables: {
          DistributorId:{"id":this.props.user.distributorx.id},
          shopperId:{"id":this.props.user.shopperx.id}
        },
        updateQuery: (previous, { subscriptionData }) => {
          let { mutation,node,previousValues } = subscriptionData.data.Chat
          if (mutation === 'UPDATED') {
            this.updateChatOnChatList(previousValues,node)
          }
        },
        onError: e => {
          this.openError('retrieving new real-time chats')
          debugging && console.log('subToDistributorsChats error:',e.message)
        }
      })
    }
  }

  showModal(modalType,title,description,message=''){
    if (modalType && title) {
      this.setState({modalType,modalContent:{
        title,description,message
      }},()=>{
        this.setState({isModalOpen:true})
      })
    } else {
      this.setState({modalType},()=>{
        this.setState({isModalOpen:true})
      })
    }
  }

  renderModal(){
    return (
      <Modals
        isOpen={this.state.isModalOpen}
        close={() => this.setState({ isModalOpen:false })}
        type={this.state.modalType}
        content={this.state.modalContent}/>
    )
  }

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Chat',errText)
      },700)
    })
  }

  renderChats(){
    // this.props.user.distributorx.status
    if (this.state.chats) {
      return this.state.chats.map( chat => {
        return <ChatCard key={chat.id} chat={chat} userType={this.state.userType} viewersStatus={this.props.distributorStatus} nav={this.props.nav} level={this.props.user.distributorx.level}/>
      })
    } else {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret text="loading chats..." color={Colors.blue} size={Texts.larger.fontSize}/>
        </View>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{
        flex: this.state.chats ? 0 : 1,
        paddingBottom:6
      }}>
        {this.renderChats()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Chats" size={Texts.xlarge.fontSize} color={Colors.blue}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

const mapStateToProps = state => ({
  chats: state.chats,
  unreadCount: state.unreadCount
})

const ChatContainer = compose(
  graphql(GetChatsForDistributor,{
    name: 'getChatsForDistributor',
    options: props => ({
      variables: {
        DistributorId: {
          id: props.user && props.user.distributorx && props.user.distributorx.id ? props.user.distributorx.id : ''
        },
        shopperId: {
          id: props.user && props.user.shopperx && props.user.shopperx.id ? props.user.shopperx.id : ''
        }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetChatsForShopper,{
    name: 'getChatsForShopper',
    options: props => ({
      // pollInterval: 15000,
      variables: {
        ShopperId: {
          id: props.user && props.user.shopperx && props.user.shopperx.id ? props.user.shopperx.id : ''
        }
      },
      fetchPolicy: 'network-only'
    })
  })
)(Chat)

export default connect(mapStateToProps,{
  setChats,
  markUnread,
  markRead,
  incrementUnreadCount,
  decrementUnreadCount
})(ChatContainer)