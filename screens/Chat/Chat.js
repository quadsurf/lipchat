

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

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
    // userType: this.props.user && this.props.user.type ? this.props.user.type : null,
    userType: this.props.userType ? this.props.userType : null,
    chats: []
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getChatsForDistributor && newProps.getChatsForDistributor.allChats
    ) {
      if (this.props.userType === 'DIST') {
        this.chatsForDist(newProps.getChatsForDistributor.allChats)
      }
    }
    if (
      newProps.getChatsForShopper && newProps.getChatsForShopper.allChats
    ) {
      if (this.props.userType === 'SHOPPER') {
        this.chatsForShopper(newProps.getChatsForShopper.allChats)
      }
    }
  }

  chatsForDist(chats){
    this.updateChatsList(chats)
  }

  chatsForShopper(chats){
    this.updateChatsList(chats)
  }
  
  updateChatsList(allChats){
    let chats = JSON.parse(JSON.stringify(allChats))
    chats.sort( (a,b) => {
      return Date.parse(b.messages[0].updatedAt) - Date.parse(a.messages[0].updatedAt)
    })
    if (chats !== this.state.chats) {
      this.setState({chats})
    }
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
          if (debugging) console.log('subToShoppersChats error:',e);
        }
      })
    }
  }
  
  addChatToChatList(chat,cameFrom){
    if (debugging) console.log('addChatToChatList func called');
    if (debugging) console.log('Came From: ',cameFrom);
    let chats = JSON.parse(JSON.stringify(this.state.chats))
    let i = chats.findIndex( chatIndex => {
      return chatIndex.id === chat.id
    })
    if (i !== -1) {
      if (debugging) console.log('findIndex match found, so remove then add');
      chats.splice(i,1)
      // dispatch here
      chats.unshift(chat)
      this.setState({chats})
    } else {
      if (debugging) console.log('no findIndex match found, so just add');
      // dispatch here
      this.setState({
        chats: [
          chat,
          ...this.state.chats
        ]
      })
    }
  }
  
  updateChatOnChatList(prevChat,nextChat){
    if (debugging) console.log('updateChatOnChatList func called');
    let subjectChat = this.state.chats.find( chat => {
      return chat.id === nextChat.id
    })
    if (!subjectChat) {
      this.addChatToChatList(nextChat,'updateChatOnChatList with no subjectChat')
    } else {
      if (prevChat && nextChat) {
        if (nextChat.type === 'DIST2SHPRS') {
          let shopperExists = subjectChat.shoppersx.find( shopper => {
            return shopper.id === this.props.user.shopperx.id
          })
          if (!shopperExists) {
            this.removeChatFromChatList(prevChat,'updateChatOnChatList')
          }
        } else if (nextChat.type === 'SADVR2ALL') {
            this.addChatToChatList(nextChat,'updateChatOnChatList with subjectChat (SADVR2ALL)')
        } else if (prevChat.updater !== nextChat.updater) {
          this.addChatToChatList(nextChat,'updateChatOnChatList with subjectChat (updater is diff)')
        }
      } else {
        if (debugging) console.log('no prevChat value');
      }
    }
  }
  
  removeChatFromChatList(prevChat,cameFrom){
    if (debugging) console.log('removeChatFromChatList func called',cameFrom);
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
          if (debugging) console.log('subToShoppersChats error:',e);
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
        <DotsLoader
          size={15}
          color={Colors.pinkly}
          frequency={5000}/>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingBottom:6}}>
        {this.renderChats()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Chats" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

export default compose(
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
