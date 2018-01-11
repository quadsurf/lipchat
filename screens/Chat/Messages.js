

import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard
} from 'react-native'

// ENV VARS


// LIBS
import { compose,graphql } from 'react-apollo'
import { Entypo } from '@expo/vector-icons'
import { NavigationActions } from 'react-navigation'
import { DotsLoader } from 'react-native-indicator'
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

// GQL
import { GetMessagesForChat } from '../../api/db/queries'
import { SubToChatsMessages } from '../../api/db/pubsub'
import {
  CreateChatMessage,UpdateChatMessage,DeleteChatMessage,TriggerEventOnChat
} from '../../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs
const screen = getDimensions()
const deviceSize = screen.width > 400 ? 'bigEnuf' : 'tooSmall'
const textInputStyle = {
  fontFamily:'Poiret',backgroundColor:'transparent',color:Colors.blue,
  width:screen.width,fontSize:Texts.medium.fontSize,height:32
}

// COMPONENTS
import Message from './Message'

class Messages extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    userId: this.props.navigation.state.params.nav.state.params.localStorage.userId || null,
    chatId: this.props.navigation.state.params.chatId,
    messages: null,
    newMessage: '',
    messageId: null,
    keyboardHeight: 0,
    height: 40
  }

  componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillUnmount(){
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    this.deleteMessage()
  }

  keyboardDidShow = (e) => {
    this.flatListRef.scrollToOffset({animated:true,offset:-(e.endCoordinates.height+14)})
    // this.setState({keyboardHeight:-(e.endCoordinates.height)},()=>{
    //   this.flatListRef.scrollToOffset({animated:true,offset:this.state.keyboardHeight})
    // })
  }

  keyboardDidHide = () => {
    this.flatListRef.scrollToOffset({animated:true,offset:-14})
    // this.setState({keyboardHeight:0})
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
      if (newProps.getMessagesForChat && Array.isArray(newProps.getMessagesForChat.allMessages)) {
        this.setState({messages:newProps.getMessagesForChat.allMessages},()=>{
          console.log('messages: ',this.state.messages);
        })
      }
    }
  }

  componentDidMount(){
    this.subToMessages()
  }

  subToMessages(){
    if (
      this.props.navigation &&
      this.state.chatId
    ) {
      this.props.getMessagesForChat.subscribeToMore({
        document: SubToChatsMessages,
        variables: {ChatId:{"id":this.state.chatId}},
        updateQuery: (previous, { subscriptionData }) => {
          let mutation = subscriptionData.data.Message.mutation
          if (mutation === 'CREATED') {
            this.setState({
              messages: [
                subscriptionData.data.Message.node,
                ...this.state.messages
              ]
            })
          }
          if (mutation === 'UPDATED') {
            let messages = JSON.parse(JSON.stringify(this.state.messages))
            let i = messages.findIndex( message => {
            	return message.id === subscriptionData.data.Message.node.id
            })
            messages[i] = subscriptionData.data.Message.node
            this.setState({messages})
          }
          if (mutation === 'DELETED') {
            let messages = JSON.parse(JSON.stringify(this.state.messages))
            let i = messages.findIndex( message => {
            	return message.id === subscriptionData.data.Message.previousValues.id
            })
            if (i !== -1) {
              messages.splice(i,1)
              this.setState({messages})
            }
          }
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
        this.showModal('err','Messages',errText)
      },700)
    })
  }

  isTyping(newMessage){
    this.setState((prevState, props) => {
      if (prevState.newMessage !== newMessage) {
        if (newMessage.length > 0 && prevState.newMessage.length === 0) {
          this.createMessage()
          return {newMessage}
        }
        if (newMessage.length === 0 && prevState.newMessage.length > 0) {
          this.deleteMessage()
          return {newMessage}
        }
        return {newMessage}
      }
    })
  }

  createMessage(){
    let errText = 'creating your chat message'
    if (this.state.chatId && this.state.userId) {
      this.props.createChatMessage({
        variables: {
          ChatId: this.state.chatId,
          writer: this.state.userId,
          text: 'isTypingNow'
        }
      }).then( res => {
        if (res && res.data && res.data.createMessage) {
          this.setState({messageId:res.data.createMessage.id})
        } else {
          this.openError(errText)
        }
      }).catch( e => {
        this.setState({isModalOpen:false},()=>{
          this.openError(errText)
        })
      })
    }
  }

  updateMessage(){
    let errText = 'sending off your chat message'
    if (this.state.messageId && this.state.newMessage && this.state.newMessage.length > 0) {
      if (deviceSize === 'tooSmall') {
        this.showModal('processing')
      }
      this.props.updateChatMessage({
        variables: {
          MessageId: this.state.messageId,
          text: this.state.newMessage
        }
      }).then((res)=>{
        if (res && res.data && res.data.updateMessage) {
          this.setState({newMessage:'',messageId:null},()=>{
            if (this.state.isModalOpen) {
              this.setState({isModalOpen:false})
            }
            this.triggerEventOnChatInDb()
          })
        } else {
          this.openError(errText)
        }
      }).catch( e => {
        if (this.state.isModalOpen) {
          this.setState({isModalOpen:false},()=>{
            this.openError(errText)
          })
        } else {
          this.openError(errText)
        }
      })
    }
  }

  deleteMessage(){
    let errText = 'clearing your chat message'
    if (this.state.messageId) {
      this.props.deleteChatMessage({
        variables: {
          MessageId: this.state.messageId
        }
      }).then((res)=>{
        if (res && res.data && res.data.deleteMessage) {
          this.setState({messageId:null})
        } else {
          this.openError(errText)
        }
      }).catch( e => {
        this.openError(errText)
      })
    }
  }

//NEEDS ERROR HANDLING  
  triggerEventOnChatInDb(){
    this.props.triggerEventOnChat({
      variables: {
        chatId: this.state.chatId,
        updater: JSON.stringify(new Date())
      }
    }).then( () => {
    }).catch( e => {
      console.log('could not trigger event on Chat node',e.message);
    })
  }
  
  renderTextInput(){
    let { height } = this.state
    return (
      <TextInput value={this.state.newMessage}
        placeholder=" send a chat"
        placeholderTextColor={Colors.transparentWhite}
        style={{...textInputStyle,height,marginBottom:14,paddingHorizontal:12}}
        onChangeText={(newMessage) => this.isTyping(newMessage)}
        keyboardType="default"
        onSubmitEditing={() => this.updateMessage()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={1024}
        returnKeyType="send"
        onContentSizeChange={(e) => this.setState({height:e.nativeEvent.contentSize.height})}
        multiline={true}
        ref={input => { this.textInput = input }}/>
    )
  }

  renderInputBox = () => {
    let { chatType,level } = this.props.navigation.state.params
    if (chatType === 'SADVR2ALL') {
      if (level === 'A') {
        return this.renderTextInput()
      } else {
        return <View style={{flex:1,height:20}}/>
      }
    } else {
      return this.renderTextInput()
    }
    // onBlur={() => this.createMessage()}
  }

  scrollToOffset(){
    this.flatListRef.scrollToOffset({animated:true,offset:this.state.keyboardHeight})
    // onFocus={() => this.scrollToOffset()}
  }

  // ItemSeparatorComponent={this.renderSeparater}
  renderSeparater = () => (
    <View style={{
        height: 20
      }}/>
  )

  renderNoChats = () => (
    <View style={{...Views.middle}}>
      <FontPoiret text="No Chat History Yet" size={Texts.large.fontSize}/>
    </View>
  )

  renderMessageList(){
    if (this.state.messages) {
      return (
        <FlatList
          inverted
          data={this.state.messages}
          renderItem={({ item }) => (
            <Message text={item.text} userId={this.state.userId} writer={item.writerx} updated={item.updatedAt}/>
          )}
          ref={(ref) => { this.flatListRef = ref }}
          keyExtractor={item => item.id}
          ListHeaderComponent={this.renderInputBox}
          ListEmptyComponent={this.renderNoChats}
          style={{marginBottom:0}}/>
      )
    } else {
      return (
        <View style={{...Views.middle}}>
          <DotsLoader
            size={15}
            color={Colors.pinkly}
            frequency={5000}/>
        </View>
      )
    }
  }
// <KeyboardAwareScrollView>
  renderMainContent(){
    return (
      <View style={{flex:1,width:screen.width*.98}}>
          {this.renderMessageList()}
      </View>
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
            <FontPoiret 
              text={this.props.navigation.state.params.chatTitle} 
              size={Texts.small.fontSize} 
              style={{color:Colors.blue}}/>
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
  }),
  graphql(CreateChatMessage,{
    name: 'createChatMessage'
  }),
  graphql(UpdateChatMessage,{
    name: 'updateChatMessage'
  }),
  graphql(DeleteChatMessage,{
    name: 'deleteChatMessage'
  }),
  graphql(TriggerEventOnChat,{
    name: 'triggerEventOnChat'
  })
)(Messages)

// DONE - add a loader for when it takes too long for mutation to resolve
// DONE - list of chat convos should not show isTypingNow
// DONE - error handling
// DONE - UI for smaller phones not working
// cron job clear isTypingNow messages server side
// i need an iPhone 5 and 6 to test on
// virtualized list trimming, i.e. last 10, or convert to PureComponent
// test concurrency of 2 people typing at same time and how it affects updatedAt
