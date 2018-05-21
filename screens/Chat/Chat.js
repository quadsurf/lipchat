

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// STORE
import { connect } from 'react-redux'
import {
  setChats,
  handleNewChat
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
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs
const debugging = __DEV__ && false

// COMPONENTS
import ChatCard from './ChatCard'

class Chat extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      user: this.props.user ? this.props.user : null,
      chats: null,
      isFocused: true
    }
    this.updateChatsOnState = debounce(this.updateChatsOnState,750,true)
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
      this.updateChatsOnState(newProps.chats)
    }
  }
  
  updateChatsOnState(chats){
    this.setState({chats})
  }
  
  componentWillMount(){
    this.didFocusSubscription = this.props.nav.addListener(
      'didFocus',
      ({ action:{ key } }) => {
        if (key !== 'StackRouterRoot' && !this.state.isFocused) this.setState({isFocused:true})
        debugging && console.log('didFocus:',key)
      }
    )
    this.didBlurSubscription = this.props.nav.addListener(
      'didBlur',
      ({ action:{ key } }) => {
        key !== 'StackRouterRoot' && this.setState({isFocused:false})
        debugging && console.log('didBlur:',key)
      }
    )
  }
  
  componentDidMount(){
    this.subToShoppersChats()
    this.subToDistributorsChats()
  }

  componentWillUnmount(){
    this.didFocusSubscription.remove()
    this.didBlurSubscription.remove()
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
    this.props.handleNewChat(chat,isSelf,this.state.isFocused)
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
    if (this.state.chats) {
      return this.state.chats.map( chat => {
        return <ChatCard key={chat.id} chat={chat}/>
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
        <FontPoiret text="Chats" size={Texts.xlarge.fontSize} color={Colors.blue}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

Chat.propTypes = {
  chats: PropTypes.array.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  userType: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  chats: state.chats,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id,
  userType: state.user.type
})

const ChatWithData = compose(
  graphql(GetChatsForDistributor,{
    name: 'getChatsForDistributor',
    options: props => ({
      variables: {
        DistributorId: {
          id: props.distributorId
        },
        shopperId: {
          id: props.shopperId
        }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetChatsForShopper,{
    name: 'getChatsForShopper',
    options: props => ({
      variables: {
        ShopperId: { id: props.shopperId }
      },
      fetchPolicy: 'network-only',
      // pollInterval: 15000,
    })
  })
)(Chat)

export default connect(mapStateToProps,{
  setChats,
  handleNewChat
})(ChatWithData)