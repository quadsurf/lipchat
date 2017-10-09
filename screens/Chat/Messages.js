

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
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
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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
const medium = Texts.medium.fontSize
const textInputStyle = {
  fontFamily:'Poiret',backgroundColor:'transparent',color:Colors.blue,
  width:screen.width,fontSize:medium,height:32
}

// COMPONENTS
const Message = props => {
  let { text,userId,writer,updated } = props
  let uri = writer.type === 'DIST' && writer.distributorx.logoUri && writer.distributorx.logoUri.length > 8 ? writer.distributorx.logoUri : `https://graph.facebook.com/${writer.fbkUserId}/picture?width=${avatarSize}&height=${avatarSize}`
  let position = userId !== writer.id ? 'left' : 'right'
  let width = screen.width*.835
  let date = {
      alignItems: position === 'left' ? 'flex-end' : 'flex-start',
      paddingLeft: 5,
      paddingRight: 5,
      paddingBottom: 2
  }
  let msgStyle = {
    width,flexDirection:'row',backgroundColor:'transparent',
    borderRadius:6,borderWidth:1,borderColor: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly,
    padding:14
  }
  let avatarLeft = {
    left: 0
  }
  let avatarRight = {
    right: 0
  }
  let triBorder = screen.width*.0125
  let tri = {
    left: 0,
    top: 21,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: triBorder,
    borderBottomWidth: triBorder,
    borderBottomColor: 'transparent'
  }
  let triLeft = {
    borderRightWidth: triBorder*2
  }
  let triLeftPink = {
    borderRightColor: Colors.pinkly
  }
  let triLeftBlue = {
    borderRightColor: Colors.blue
  }
  let triRight = {
    borderLeftWidth: triBorder*2
  }
  let triRightPink = {
    borderLeftColor: Colors.pinkly
  }
  let triRightBlue = {
    borderLeftColor: Colors.blue
  }
  return (
    <View style={{flex:1}}>
      <View style={date}>
        <FontPoiret text={moment(updated).fromNow()} size={12} color={Colors.transparentWhite}/>
      </View>
      <View style={{flexDirection:'row',justifyContent: position === 'left' ? 'flex-start' : 'flex-end'}}>
        {
          position === 'left' ?
          <View style={{flexDirection:'row'}}>
            <Image source={{uri}} style={{width:avatarSize,height:avatarSize,borderRadius:6}}/>
            <View style={[tri,triLeft,writer.type === 'SHOPPER' ? triLeftBlue : triLeftPink]} />
          </View> : null
        }
        <View style={[msgStyle,position === 'left' ? avatarLeft : avatarRight]}>
          <Text style={[{fontFamily:'Poiret',fontSize:medium,color: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly}]}>{text}</Text>
        </View>
        {
          position === 'right' ?
          <View style={{flexDirection:'row'}}>
            <View style={[tri,triRight,writer.type === 'SHOPPER' ? triRightBlue : triRightPink]} />
            <Image source={{uri}} style={{width:avatarSize,height:avatarSize,borderRadius:6}}/>
          </View> : null
        }
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
    messages: null,
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
        this.showModal('err','Messages',errText)
      },700)
    })
  }

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

  createMessage(){
    console.log('func called')
  }

  renderInputBox = () => {
    let { height } = this.state
    return (
      <TextInput value={this.state.newMessage}
        placeholder="send a chat"
        placeholderTextColor={Colors.transparentWhite}
        style={{...textInputStyle,height,marginBottom:14}}
        onChangeText={(newMessage) => this.setState({newMessage})}
        keyboardType="default"
        onBlur={() => this.createMessage()}
        onSubmitEditing={() => this.createMessage()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={1024}
        returnKeyType="send"
        onContentSizeChange={(e) => this.setState({height:e.nativeEvent.contentSize.height})}
        multiline={true}/>
    )
  }
// onFocus={() => this.scrollToOffset()}
  scrollToOffset(){
    this.flatListRef.scrollToOffset({animated:true,offset:this.state.keyboardHeight})
  }

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
          ItemSeparatorComponent={this.renderSeparater}
          ListHeaderComponent={this.renderInputBox}
          ListEmptyComponent={this.renderNoChats}
          style={{marginBottom:0}}/>
      )
    } else {
      return (
        <View style={{...Views.middle}}>
          <DotsLoader
            size={15}
            color={Colors.pink}
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
