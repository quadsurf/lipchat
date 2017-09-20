

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//ENV VARS


// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetMessagesForChat } from '../../api/db/queries'
// import {  } from '../../api/db/pubsub'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs

// <Message key={message.id} text={message.text} userId={this.state.userId}/>
// COMPONENTS
const Message = props => {
  let { text,userId,writerId } = props
  let position = userId !== writerId ? 'left' : 'right'
  let screen = getDimensions()
  let medium = Texts.medium.fontSize
  let width = screen.width*.9
  // let imgStyle = {}
  let msgStyle = {
    width,flexDirection:'row',backgroundColor:'transparent',
    borderRadius:10,borderWidth:1,borderColor:Colors.blue,
    marginVertical:10,padding:10
  }
  return (
    <View style={msgStyle}>
      <FontPoiret text={text} size={medium} color={Colors.blue}/>
    </View>
  )
}

class Messages extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    userId: this.props.navigation.state.params.nav.state.params.localStorage.userId || null,
    messages: null
  }

  componentWillMount(){
    // console.log('userId',this.state.userId);
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
    return false
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      // console.log('messages for chat: ',newProps.getMessagesForChat);
      if (newProps.getMessagesForChat && Array.isArray(newProps.getMessagesForChat.allMessages)) {
        this.setState({messages:newProps.getMessagesForChat.allMessages})
      }
    }
  }

  componentDidMount(){
    // this.subToMessages()
  }

  // subToMessages(){
  //   if (this.props.user && this.props.user.shopperx && this.props.user.shopperx.id) {
  //     this.props.getMessagesForChat.subscribeToMore({
  //       document: SubToMessagesForChat,
  //       variables: {ShopperId:{"id":this.props.user.shopperx.id}},
  //       updateQuery: (previous, { subscriptionData }) => {
  //         let mutation = subscriptionData.data.Chat.mutation
  //         if (mutation === 'CREATED') {
  //           this.setState({
  //             chats: [
  //               ...this.state.chats,
  //               subscriptionData.data.Chat.node
  //             ]
  //           })
  //         }
  //         if (mutation === 'DELETED') {
  //           let chats = JSON.parse(JSON.stringify(this.state.chats))
  //           let i = chats.findIndex( chat => {
  //           	return chat.id === subscriptionData.data.Chat.previousValues.id
  //           })
  //           if (i !== -1) {
  //             chats.splice(i,1)
  //             this.setState({chats})
  //           }
  //         }
  //       }
  //     })
  //   }
  // }

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

  renderMessages(){
    if (this.state.messages) {
      return this.state.messages.map( message => {
        return <Message key={message.id} text={message.text} userId={this.state.userId} writerId={message.writerx.id}/>
      })
    } else {
      return (
        <DotsLoader
          size={15}
          color={Colors.pink}
          frequency={5000}/>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingBottom:6}}>
        {this.renderMessages()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Messages" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

export default compose(
  graphql(GetMessagesForChat,{
    name: 'getMessagesForChat',
    options: props => ({
      variables: {
        ChatId: {
          id: props.navigation.state.params.chatId
        }
      },
      fetchPolicy: 'network-only'
    })
  })
)(Messages)
