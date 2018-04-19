

import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  TextInput,
  Keyboard
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
// import { withNavigation } from 'react-navigation'
import { Entypo,SimpleLineIcons } from '@expo/vector-icons'
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
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs
const screen = getDimensions()
const deviceSize = screen.width > 400 ? 'bigEnuf' : 'tooSmall'
const textInputStyle = {
  fontFamily:'Poiret',backgroundColor:'transparent',color:Colors.blue,
  width:screen.width,fontSize:Texts.medium.fontSize,height:32
}
const chatCount = 5
const debugging = __DEV__ && true

// COMPONENTS
import Message from './Message'

// @withNavigation
class Messages extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    userId: this.props.navigation.state.params.userId,
    chatId: this.props.navigation.state.params.chatId,
    messages: null,
    newMessage: '',
    messageId: null,
    keyboardHeight: 0,
    height: 40,
    audience: 'ANY',
    SHOPPERS: false,
    APPROVED: false,
    PENDINGS: false,
    isMounted: false,
    isRefreshing: false
  }

  componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    this.setState({isMounted:true})
  }

  componentWillUnmount(){
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
    this.deleteChatMessageInDb()
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

  componentWillReceiveProps(newProps){
    if (newProps.getMessagesForChat.allMessages !== this.state.messages) {
      this.setState({messages:newProps.getMessagesForChat.allMessages})
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
      const { aud1,aud2,aud3,aud4,aud5,aud6,aud7 } = this.props.navigation.state.params.audiences
      this.props.getMessagesForChat.subscribeToMore({
        document: SubToChatsMessages,
        variables: {
          ChatId:{"id":this.state.chatId},
          aud1,
          aud2,
          aud3,
          aud4,
          aud5,
          aud6,
          aud7
        },
        updateQuery: (previous, { subscriptionData }) => {
          let mutation = subscriptionData.data.Message.mutation
          let { isMounted } = this.state
          if (mutation === 'CREATED' && isMounted) {
            this.setState({
              messages: [
                subscriptionData.data.Message.node,
                ...this.state.messages
              ]
            })
            debugging && console.log('isMounted for CREATED mutation:',isMounted)
          }
          if (mutation === 'UPDATED' && isMounted) {
            this.insertNewMessageIntoMessages(subscriptionData.data.Message.node)
            debugging && console.log('isMounted for UPDATED mutation:',isMounted)
          }
          if (mutation === 'DELETED' && isMounted) {
            this.removeMessageFromMessages(subscriptionData.data.Message.previousValues.id)
            debugging && console.log('isMounted for DELETED mutation:',isMounted)
          }
        }
      })
    }
  }
  
  insertNewMessageIntoMessages(newMessage){
    let messages = [...this.state.messages]
    let i = messages.findIndex( message => {
      return message.id === newMessage.id
    })
    messages[i] = {
      ...messages[i],
      ...newMessage
    }
    this.setState({messages})
  }
  
  removeMessageFromMessages(id){
    if (id) {
      let messages = [...this.state.messages]
      let i = messages.findIndex( message => {
        return message.id === id
      })
      if (i !== -1) {
        messages.splice(i,1)
        this.state.isMounted && this.setState({messages})
      }
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
        this.state.isMounted && this.showModal('err','Messages',errText)
      },700)
    })
  }

  isTyping(newMessage){
    this.setState((prevState, props) => {
      if (prevState.newMessage !== newMessage) {
        if (newMessage.length > 0 && prevState.newMessage.length === 0) {
          this.createChatMessageInDb()
          return {newMessage}
        }
        if (newMessage.length === 0 && prevState.newMessage.length > 0) {
          this.deleteChatMessageInDb()
          return {newMessage}
        }
        return {newMessage}
      }
    })
  }

  createChatMessageInDb(){
    let errText = 'creating your chat message'
    if (this.state.chatId && this.state.userId) {
      this.props.createChatMessage({
        variables: {
          ChatId: this.state.chatId,
          writer: this.state.userId,
          text: 'isTypingNow',
          audience: this.state.audience
        }
      }).then( ({ data: { createMessage={} } }) => {
        if (createMessage.hasOwnProperty('id')) {
          this.setState({messageId:createMessage.id})
        } else {
          this.openError(`${errText}-(1)`)
        }
      }).catch( e => {
        this.openError(errText)
        debugging && console.log('(2)',e.message)
      })
    } else {
      this.openError(`${errText}-(insufficient args)`)
    }
  }

  clearMessage(){
    this.state.isMounted && this.setState({
      newMessage: '',
      messageId: null,
      isModalOpen: false
    },()=>console.log('message cleared'))
  }
  
  updateChatMessageInDb(){
    let errText = 'sending off your chat message'
    let { messageId,newMessage='' } = this.state
    if (messageId && newMessage.length > 0) {
      this.insertNewMessageIntoMessages({id:messageId,text:newMessage})
      if (deviceSize === 'tooSmall') {
        this.showModal('processing')
      }
      this.props.updateChatMessage({
        variables: {
          MessageId: messageId,
          text: newMessage
        }
      }).then(({ data: { updateMessage={} } })=>{
        if (updateMessage.hasOwnProperty('text')) {
          this.triggerEventOnChatInDb()
          if (updateMessage.text === newMessage) {
            this.clearMessage()
          } else {
            this.openError(`${errText}-(1)`)
            this.insertNewMessageIntoMessages({id:messageId,sent:false})
            this.clearMessage()
          }
        }
      }).catch( e => {
        this.openError(`${errText}-(2)`)
        this.insertNewMessageIntoMessages({id:messageId,sent:false})
        this.clearMessage()
        debugging && console.log('(2)',e.message)
      })
    } else {
      this.openError(`${errText}-(3)`)
    }
  }

  deleteChatMessageInDb(){
    let errText = 'clearing your chat message'
    let { messageId } = this.state
    if (messageId) {
      this.props.deleteChatMessage({
        variables: {
          MessageId: messageId
        }
      }).then(({ data:{ deleteMessage={} } })=>{
        if (!deleteMessage.hasOwnProperty('id')) {
          this.openError(`${errText}-(1)`)
          this.clearMessage()
          // this.setState({messageId:null})
        }
      }).catch( e => {
        this.openError(`${errText}-(2)`)
        this.clearMessage()
        debugging && console.log('(2)',e.message)
      })
    } else {
      // this.openError(errText)
    }
  }

  triggerEventOnChatInDb(){
    this.props.triggerEventOnChat({
      variables: {
        chatId: this.state.chatId,
        updater: JSON.stringify(new Date())
      }
    }).catch( e => {
      debugging && console.log('(2)',e.message)
    })
  }
  
  processAudience(){
    let { SHOPPERS,APPROVED,PENDINGS } = this.state
    if (SHOPPERS && APPROVED && PENDINGS) {
      this.setState({audience:'SHPSDSTS'})
    } else if (SHOPPERS && APPROVED) {
      this.setState({audience:'SHPSAPPS'})
    } else if (SHOPPERS && PENDINGS) {
      this.setState({audience:'SHPSPNDS'})
    } else if (APPROVED && PENDINGS) {
      this.setState({audience:'APPSPNDS'})
    } else if (SHOPPERS) {
      this.setState({audience:'SHOPPERS'})
    } else if (APPROVED) {
      this.setState({audience:'APPROVED'})
    } else if (PENDINGS) {
      this.setState({audience:'PENDINGS'})
    } else {
      this.setState({audience:'ANY'})
    }
  }
  
  setAudienceState(audType){
    this.setState({
      [audType]: !this.state[audType]
    },()=>this.processAudience())
  }
  
  renderAudienceButton(display,audType){
    return (
      <TouchableHighlight 
        onPress={() => this.setAudienceState(audType)}
        style={{
          height: 40,
          width: .20*screen.width,
          backgroundColor: this.state[audType] ? Colors.pinkly : Colors.transparentWhite,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7
        }}>
        <Text style={{color:Colors.purple}}>{display}</Text>
      </TouchableHighlight>
    )
  }
  
  renderTextInput(bool){
    let { height } = this.state
    return (
      <View style={{flex:1}}>
        {
          bool ? <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            flex: 1,
            height: 40,
            marginVertical: 10
          }}>
            {this.renderAudienceButton('shoppers','SHOPPERS')}
            {this.renderAudienceButton('ap dists','APPROVED')}
            {this.renderAudienceButton('un dists','PENDINGS')}
          </View> : null
        }
        <TextInput value={this.state.newMessage}
          placeholder=" send a chat"
          placeholderTextColor={Colors.transparentWhite}
          style={{...textInputStyle,height,marginBottom:14,paddingHorizontal:12}}
          onChangeText={(newMessage) => this.isTyping(newMessage)}
          keyboardType="default"
          onSubmitEditing={() => this.updateChatMessageInDb()}
          blurOnSubmit={true}
          autoCorrect={false}
          maxLength={1024}
          returnKeyType="send"
          onContentSizeChange={(e) => this.setState({height:e.nativeEvent.contentSize.height})}
          multiline={true}
          ref={input => { this.textInput = input }}/>
      </View>
    )
  }

  renderInputBox = () => {
    let { chatType,level } = this.props.navigation.state.params
    if (chatType === 'SADVR2ALL') {
      if (level === 'A') {
        return this.renderTextInput(true)
      } else {
        return <View style={{flex:1,height:20}}/>
      }
    } else {
      return this.renderTextInput(false)
    }
    // onBlur={() => this.createChatMessageInDb()}
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
  
  fetchMoreChats = () => {
    this.setState({isRefreshing:true},()=>{
      this.props.getMessagesForChat.fetchMore({
        variables: {
          skipCount: this.state.messages.length
        },
        updateQuery: (prev,{fetchMoreResult}) => {
            if (
              fetchMoreResult && 
              fetchMoreResult.allMessages && 
              fetchMoreResult.allMessages.length > 0
            ) {
              this.setState({
                messages: [
                  ...this.state.messages,
                  ...fetchMoreResult.allMessages
                ],
                isRefreshing: false
              },()=>{
                this.flatListRef.scrollToEnd()
              })
            } else {
              this.setState({isRefreshing:false})
            }
        }
      })
    })
  }

  renderMessageList(){
    // this.props.getMessagesForChat.networkStatus === 4 
    // refreshing={this.state.isRefreshing} 
    // onRefresh={this.fetchMoreChats}
    if (this.state.messages) {
      return (
        <FlatList
          inverted
          data={this.state.messages}
          renderItem={({ item }) => (
            <Message 
              text={item.text} 
              sent={item.hasOwnProperty('sent') ? item.sent : null}
              userId={this.state.userId} 
              writer={item.writerx} 
              updated={item.updatedAt} 
              level={this.props.navigation.state.params.level} 
              chatType={this.props.navigation.state.params.chatType} 
              audience={item.audience}/>
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

  prepForUnmount(){
    this.setState({isMounted:false},()=>this.props.navigation.goBack(null))
  }
  
  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <View style={{width:screen.width,height:80,flexDirection:'row',justifyContent:'space-between'}}>
          <View style={{justifyContent:'center'}}>
            <TouchableOpacity onPress={() => this.prepForUnmount()}>
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
          <View style={{justifyContent:'center'}}>
            <TouchableOpacity onPress={this.fetchMoreChats}>
              <SimpleLineIcons name="cloud-download" size={47} style={{color:Colors.blue,marginRight:14,marginTop:3}}/>
            </TouchableOpacity>
          </View>
        </View>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}
// <EvilIcons name="refresh" size={70} style={{color:Colors.blue,marginRight:4}}/>
export default compose(
  graphql(GetMessagesForChat,{
    name: 'getMessagesForChat',
    options: props => ({
      variables: {
        ChatId: {
          id: props.navigation.state.params.chatId
        },
        chatCount,
        skipCount: 0,
        aud1: props.navigation.state.params.audiences.aud1,
        aud2: props.navigation.state.params.audiences.aud2,
        aud3: props.navigation.state.params.audiences.aud3,
        aud4: props.navigation.state.params.audiences.aud4,
        aud5: props.navigation.state.params.audiences.aud5,
        aud6: props.navigation.state.params.audiences.aud6,
        aud7: props.navigation.state.params.audiences.aud7
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
// import { NavigationActions } from 'react-navigation'
// this.props.navigation.dispatch(NavigationActions.back())