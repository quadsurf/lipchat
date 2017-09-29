

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity
} from 'react-native'

// ENV VARS


// LIBS
import { compose,graphql } from 'react-apollo'
import { Entypo } from '@expo/vector-icons'
import { NavigationActions } from 'react-navigation'
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
const screen = getDimensions()
const avatarSize = 50

// COMPONENTS
const Message = props => {
  let { text,userId,writer } = props
  let uri = writer.type === 'DIST' && writer.distributorx.logoUri && writer.distributorx.logoUri.length > 8 ? writer.distributorx.logoUri : `https://graph.facebook.com/${writer.fbkUserId}/picture?width=${avatarSize}&height=${avatarSize}`
  let position = userId !== writer.id ? 'left' : 'right'
  let medium = Texts.medium.fontSize
  let width = screen.width*.9
  // let imgStyle = {}
  let msgStyle = {
    width,flexDirection:'row',backgroundColor:'transparent',
    borderRadius:10,borderWidth:1,borderColor: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly,
    marginVertical:10,padding:10
  }
  return (
    <View style={{flexDirection:'row',justifyContent: position === 'left' ? 'flex-start' : 'flex-end'}}>
      <View>
        <Image source={{uri}} style={{width:avatarSize,height:avatarSize,borderRadius:6}}/>
      </View>
      <View style={msgStyle}>
        <Text style={{fontFamily:'Poiret',fontSize:medium,color: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly}}>{text}</Text>
      </View>
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
      if (this.state.messages.length > 0) {
        return this.state.messages.map( message => {
          return <Message key={message.id} text={message.text} userId={this.state.userId} writer={message.writerx}/>
        })
      } else {
        return (
          <View style={{...Views.middle}}>
            <FontPoiret text="No Chat History Yet" size={Texts.large.fontSize}/>
          </View>
        )
      }
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
      <ScrollView contentContainerStyle={{flex:0,paddingBottom:6,width:screen.width*.98}}>
        {this.renderMessages()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <View style={{width:screen.width,height:80,flexDirection:'row',justifyContent:'space-between'}}>
          <View style={{justifyContent:'center'}}>
            <TouchableOpacity onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
              <Entypo name="chevron-thin-left" size={40} style={{color:Colors.blue,marginLeft:6}}/>
            </TouchableOpacity>
          </View>
          <View style={{alignItems:'center'}}>
            <Image source={{uri:this.props.navigation.state.params.uri}} style={{width:50,height:50,borderRadius:25,marginTop:6}}/>
            <FontPoiret text={`Chatting with ${this.props.navigation.state.params.chatTitle}`} size={Texts.small.fontSize} style={{color:Colors.blue}}/>
          </View>
          <View>
            <Entypo name="dot-single" size={50} style={{color:Colors.purple}}/>
          </View>
        </View>
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
