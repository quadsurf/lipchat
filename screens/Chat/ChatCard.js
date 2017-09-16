

import React, {Component} from 'react'
import {
  View,Image,Text
} from 'react-native'

//ENV VARS

//LIBS
import { DotsLoader } from 'react-native-indicator'
import moment from 'moment'

// GQL

// LOCALS
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
import { getDimensions,clipText } from '../../utils/Helpers'

// CONSTs
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const size = 90
const screen = getDimensions()

const ChatCardLayout = props => {
  let { approved,uri,chatTitle,chatSubTitle,message,date,line1,line2 } = props
  let width = screen.width*.95
  let cardLeft = {width:size,height:size}
  let cardRight = {height:size,paddingHorizontal:10,paddingVertical:5}
  let noExist = {
    height:size,justifyContent:'center',alignItems:'center',paddingLeft:10
  }
  let imgSize = {...cardLeft,borderRadius:12}
  let cardStyle = {
    width,flexDirection:'row',backgroundColor:Colors.pinkly,borderRadius:12,marginVertical:6
  }

  if (approved) {
    return (
      <View style={cardStyle}>
        <View style={cardLeft}>
          <Image source={{uri}} style={imgSize}/>
        </View>
        <View style={cardRight}>
          <FontPoiret text={clipText(chatTitle,17)} size={medium} color={Colors.white}/>
          {
            chatSubTitle ?
            <FontPoiret text={clipText(chatSubTitle,20)} size={small} color={Colors.white}/> :
              null
          }
          <FontPoiret text={message} size={small} color={Colors.white}/>
          <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
        </View>
      </View>
    )
  } else {
    return (
      <View style={cardStyle}>
        <View style={cardLeft}>
          <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
        </View>
        <View style={noExist}>
          <FontPoiret text="show lock" size={medium} color={Colors.white}/>
          <FontPoiret text={line1} size={medium} color={Colors.white}/>
          <FontPoiret text={line2} size={medium} color={Colors.white}/>
        </View>
      </View>
    )
  }
}

const ChatCard = props => {

  let { chat,userType,viewersStatus } = props
  // console.log('props on ChatCard',props);
  let { id,alias } = chat
  let count = chat.messages.length
  let date = chat.updatedAt
  let chattingWith,bizName,logoUri,status
  if (userType === 'SHOPPER') {
    chattingWith = chat.distributorsx[0] || {}
    // chat.distributorsx && chat.distributorsx.length > 0 ? chat.distributorsx[0] : {}
    bizName = chattingWith.bizName ? chattingWith.bizName : 'Your Distributor'
    logoUri = chattingWith.logoUri
    status = chattingWith.status
  }
  if (userType === 'DIST') {
    chattingWith = chat.shoppersx[0] || {}
    // chat.shoppersx && chat.shoppersx.length > 0 ? chat.shoppersx[0] : {}
  }
  let { fbkFirstName,fbkLastName,fbkUserId } = chattingWith.userx
  let name = `${fbkFirstName || ''} ${fbkLastName || ''}`

  let chatTitle = alias ? alias : userType === 'SHOPPER' ? bizName : name
  let chatSubTitle = status ? `by ${name}` : null
  let message = chat.messages.length > 0 ? chat.messages[0].text : 'no chat history'

  let uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`

  if (status) {
      // viewing approved DISTs
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing an approved DIST
            return <ChatCardLayout approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date}/>
          } else {
            // unapproved DIST viewing an approved DIST
            return <ChatCardLayout approved={false} line1="your fellow distributors are" line2="waiting for you to get approved"/>
          }
      } else {
        // shopper viewing an approved DIST [tested,passed]
        return <ChatCardLayout approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date}/>
      }
  } else {
    if (status === false) {
      // viewing unapproved DIST [tested,passed]
      return <ChatCardLayout approved={false} line1="distributor exists but has" line2="not been approved yet"/>
    } else {
      // viewing shoppers
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing a shopper [tested,passed]
            return <ChatCardLayout approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date}/>
          } else {
            // unapproved DIST viewing a shopper [tested,passed]
            return <ChatCardLayout approved={false} line1="this shopper is waiting" line2="for you to get approved"/>
          }
      } else {
        // shopper viewing shopper
        return <ChatCardLayout approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date}/>
      }
    }
  }

}

export default ChatCard
