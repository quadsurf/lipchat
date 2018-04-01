

import React, { Component } from 'react'
import {
  View,Image,TouchableOpacity
} from 'react-native'

//LIBS
import moment from 'moment'
import { withNavigation } from 'react-navigation'
import { Foundation } from '@expo/vector-icons'
import { debounce } from 'underscore'

//STORE
import { connect } from 'react-redux'
import { handleClearedChat } from './store/actions'

// LOCALS
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
import { getDimensions,clipText } from '../../utils/Helpers'

// CONSTs
const size = 90

@withNavigation
class ChatCardLayout extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      unreadStatus: this.props.chat.unreadStatus ? this.props.chat.unreadStatus : false
    }
    this.navToMessages = debounce(this.navToMessages,4000,true)
  }
  
  componentWillReceiveProps(newProps){
    if (newProps.thisChat) {
      this.setState({
        unreadStatus: newProps.thisChat.unreadStatus ? newProps.thisChat.unreadStatus : false
      })
    }
  }
  
  navToMessages(audiences){
    let {
      chat,userId,chatId,uri,chatTitle,chatType,level,handleClearedChat
    } = this.props
    if (this.state.unreadStatus) {
      handleClearedChat(chat)
    }
    this.props.navigation.navigate('Messages',{userId,chatId,uri,chatTitle,chatType,level,audiences})
  }
  
  render(){
    let {
      chatId,approved,uri,chatTitle,chatSubTitle,
      audience,message,date,line1,line2
    } = this.props
    let screen = getDimensions()
    let small = Texts.small.fontSize
    let medium = Texts.medium.fontSize
    let bR = 6
    let width = screen.width*.95
    let cardLeft = {width:size,height:size}
    let cardRight = {height:size,paddingHorizontal:10,paddingVertical:5}
    let noExist = {
      height:size,justifyContent:'center',alignItems:'center',paddingLeft:10
    }
    let imgSize = {...cardLeft,borderRadius:bR}
    let cardStyle = {
      width,flexDirection:'row',backgroundColor:Colors.pinkly,borderRadius:bR,marginVertical:6
    }
    let unread = {
      position:'absolute',top:6,right:6,width:10,height:10,borderRadius:5,backgroundColor:Colors.blue
    }
    let textWidth = width-size-20
    let audiences = {}
    if (audience === 'SHPS') {
      audiences = {
        aud1: 'SHOPPERS',
        aud2: 'SHPSAPPS',
        aud3: 'SHPSPNDS',
        aud4: 'ANY',
        aud5: 'ANY',
        aud6: 'ANY',
        aud7: 'SHPSDSTS'
      }
    }
    if (audience === 'APPS') {
      audiences = {
        aud1: 'APPROVED',
        aud2: 'SHPSAPPS',
        aud3: 'APPSPNDS',
        aud4: 'ANY',
        aud5: 'ANY',
        aud6: 'ANY',
        aud7: 'SHPSDSTS'
      }
    }
    if (audience === 'PNDS') {
      audiences = {
        aud1: 'PENDINGS',
        aud2: 'APPSPNDS',
        aud3: 'SHPSPNDS',
        aud4: 'ANY',
        aud5: 'ANY',
        aud6: 'ANY',
        aud7: 'SHPSDSTS'
      }
    }
    if (audience === 'ANY') {
      audiences = {
        aud1: 'SHOPPERS',
        aud2: 'APPROVED',
        aud3: 'PENDINGS',
        aud4: 'SHPSAPPS',
        aud5: 'SHPSPNDS',
        aud6: 'APPSPNDS',
        aud7: 'SHPSDSTS'
      }
    }
    
    let { unreadStatus } = this.state
    
    if (approved) {
      // the person being viewed is approved
      return (
        <TouchableOpacity style={cardStyle} onPress={() => this.navToMessages(audiences)}>
          <View style={cardLeft}>
            <Image source={{uri}} style={imgSize}/>
          </View>
          <View style={cardRight}>
            <FontPoiret text={clipText(chatTitle,30)} size={medium} color={Colors.white}/>
            {
              chatSubTitle ?
              <FontPoiret text={clipText(chatSubTitle,30)} size={small} color={Colors.white}/> :
                null
            }
            {
              message !== 'isTypingNow' ?
              <View style={{width:textWidth}}><FontPoiret text={message} size={small} color={Colors.white}/></View> :
              <View style={{width:textWidth}}><FontPoiret text="typing..." size={small} color={Colors.white}/></View>
            }
            <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
          </View>
          {
            unreadStatus ? <View style={unread}/> : <View/>
          }
        </TouchableOpacity>
      )
    } else {
      // the person being viewed is unapproved
      return (
        <View style={cardStyle}>
          <View style={cardLeft}>
            <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
          </View>
          <View style={noExist}>
            <Foundation name="lock" size={30} color={Colors.white}/>
            <FontPoiret text={line1} size={medium} color={Colors.white}/>
            <FontPoiret text={line2} size={medium} color={Colors.white}/>
          </View>
        </View>
      )
    }
  }
}

const mapStateToProps = (state,props) => {
  let i = state.chats.findIndex( chat => {
    return chat.id === props.chatId
  })
  return {
    thisChat: state.chats[i]
    // chats: state.chats
  }
}

export default connect(mapStateToProps,{ handleClearedChat })(ChatCardLayout)