

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { withNavigation } from 'react-navigation'
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
import { FontPoiret } from '../common/fonts'
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs
const duration = 1000
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
      isFocused: true
    }
    this.setChats = debounce(this.setChats,duration,true)
    this.updateChatsOnState = debounce(this.updateChatsOnState,duration,true)
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getChatsForDistributor &&
      newProps.getChatsForDistributor.allChats &&
      newProps.getChatsForDistributor.allChats !== this.props.getChatsForDistributor.allChats
    ) {
      if (this.props.userType === 'DIST' || this.props.userType === 'SADVR') {
        this.setChats(newProps.getChatsForDistributor.allChats)
      }
    }
    if (
      newProps.getChatsForShopper &&
      newProps.getChatsForShopper.allChats &&
      newProps.getChatsForShopper.allChats !== this.props.getChatsForShopper.allChats
    ) {
      if (this.props.userType === 'SHOPPER') {
        this.setChats(newProps.getChatsForShopper.allChats)
      }
    }
  }

  setChats(chats){
    this.props.setChats(chats)
  }

  updateChatsOnState(chats){
    this.setState({chats})
  }

  componentWillMount(){
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      ({ action:{ key } }) => {
        if (key !== 'StackRouterRoot' && !this.state.isFocused) this.setState({isFocused:true})
        debugging && console.log('didFocus:',key)
      }
    )
    this.didBlurSubscription = this.props.navigation.addListener(
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
    let { shopperId } = this.props
    if (shopperId) {
      this.props.getChatsForShopper.subscribeToMore({
        document: SubToShoppersChats,
        variables: {ShopperId:{"id":shopperId}},
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
    if (chat.messages.length > 0 && chat.messages[0].writerx.id === this.props.userId) {
      isSelf = true
    } else {
      isSelf = false
    }
    this.props.handleNewChat(chat,isSelf,this.state.isFocused)
    debugging && console.log('addChatToChatList func called')
    debugging && console.log('args',chat,isSelf,cameFrom)
  }

  updateChatOnChatList(prevChat,nextChat){
    let subjectChat = this.props.chats.find( chat => chat.id === nextChat.id)
    if (!subjectChat) {
      this.addChatToChatList(nextChat,'updateChatOnChatList with no subjectChat')
    } else {
      if (prevChat && nextChat) {
        if (nextChat.type === 'DIST2SHPRS') {
          if (this.props.userType === 'SHOPPER') {
            let shopperExists = subjectChat.shoppersx.find( shopper => shopper.id === this.props.shopperId)
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
      debugging && console.log('subjectChat on updateChatOnChatList func',subjectChat.id)
    }
    debugging && console.log('updateChatOnChatList func called')
  }

  removeChatFromChatList(prevChat,cameFrom){
    if (cameFrom === 'updateChatOnChatList' && prevChat && prevChat.id) {
      let chats = [...this.props.chats]
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
    let { chats,userType,distributorStatus,shopperId } = this.props
    if (chats.length > 0) {
      return chats.map( chat => {
        switch(userType){
          case 'SHOPPER':
              if (!this.props.hasShoppersDistributor && chat.type === 'DMSH2DIST') {
                return null
              } else {
                return <ChatCard key={chat.id} chat={chat}/>
              }
          case 'DIST':
              if (!distributorStatus && chat.type === 'DMSH2DIST') {
                return null
              } else {
                return <ChatCard key={chat.id} chat={chat}/>
              }
          case 'SADVR':
              if (chat.type === 'DMU2ADMIN' && chat.shoppersx[0].id === shopperId) {
                return null
              }
              return <ChatCard key={chat.id} chat={chat}/>
          default: return null
        }
      })
    } else {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret
            text="loading chats..."
            color={Colors.blue}
            size={Texts.larger.fontSize} style={{
              marginTop: (this.props.screenHeight/3)
            }}/>
        </View>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{
        flex: this.props.chats ? 0 : 1,
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
  userId: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  distributorStatus: PropTypes.bool.isRequired,
  userType: PropTypes.string.isRequired,
  hasShoppersDistributor: PropTypes.bool.isRequired,
  screenHeight: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  chats: state.chats,
  userId: state.user.id,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id,
  distributorStatus: state.distributor.status,
  userType: state.user.type,
  hasShoppersDistributor: state.shoppersDistributors.length > 0 ? true : false,
  screenHeight: state.settings.screenHeight
})

const ChatWithData = compose(
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
  })
)(Chat)

const ChatWithDataWithNavigation = withNavigation(ChatWithData)

export default connect(mapStateToProps,{
  setChats,
  handleNewChat
})(ChatWithDataWithNavigation)
