

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
const screen = getDimensions()

const ChatCard = props => {

  let size = 90
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
  let chatSubTitle = `by ${name}`
  let message = chat.messages.length > 0 ? chat.messages[0].text : 'no chat history'

  let uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`

  if (status) {
      // viewing approved DISTs
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing an approved DIST
            return (
              <View style={cardStyle}>
                <View style={cardLeft}>
                  <Image source={{uri}} style={imgSize}/>
                </View>
                <View style={cardRight}>
                  <FontPoiret text={clipText(chatTitle,17)} size={medium} color={Colors.white}/>
                  <FontPoiret text={clipText(chatSubTitle,20)} size={small} color={Colors.white}/>
                  <FontPoiret text={message} size={small} color={Colors.white}/>
                  <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
                </View>
              </View>
            )
          } else {
            // unapproved DIST viewing an approved DIST
            return (
              <View style={cardStyle}>
                <View style={cardLeft}>
                  <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
                </View>
                <View style={noExist}>
                  <FontPoiret text="show lock" size={medium} color={Colors.white}/>
                </View>
              </View>
            )
          }
      } else {
        // shopper viewing an approved DIST [tested,passed]
        return (
          <View style={cardStyle}>
            <View style={cardLeft}>
              <Image source={{uri}} style={imgSize}/>
            </View>
            <View style={cardRight}>
              <FontPoiret text={clipText(chatTitle,17)} size={medium} color={Colors.white}/>
              <FontPoiret text={message} size={small} color={Colors.white}/>
              <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
            </View>
          </View>
        )
      }
  } else {
    if (status === false) {
      // viewing unapproved DIST [tested,passed]
      return (
        <View style={cardStyle}>
          <View style={cardLeft}>
            <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
          </View>
          <View style={noExist}>
            <FontPoiret text="distributor exists but hasn't" size={medium} color={Colors.white}/>
            <FontPoiret text="been approved yet" size={medium} color={Colors.white}/>
          </View>
        </View>
      )
    } else {
      // viewing shoppers
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing a shopper [tested,passed]
            return (
              <View style={cardStyle}>
                <View style={cardLeft}>
                  <Image source={{uri}} style={imgSize}/>
                </View>
                <View style={cardRight}>
                  <FontPoiret text={clipText(chatTitle,17)} size={medium} color={Colors.white}/>
                  <FontPoiret text={message} size={small} color={Colors.white}/>
                  <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
                </View>
              </View>
            )
          } else {
            // unapproved DIST viewing a shopper [tested,passed]
            return (
              <View style={cardStyle}>
                <View style={cardLeft}>
                  <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
                </View>
                <View style={noExist}>
                  <FontPoiret text="show lock" size={medium} color={Colors.white}/>
                  <FontPoiret text="this shopper is waiting for you to get approved" size={medium} color={Colors.white}/>
                </View>
              </View>
            )
          }
      } else {
        // shopper viewing shopper
        return (
          <View style={cardStyle}>
            <View style={cardLeft}>
              <Image source={{uri}} style={imgSize}/>
            </View>
            <View style={cardRight}>
              <FontPoiret text={clipText(chatTitle,17)} size={medium} color={Colors.white}/>
              <FontPoiret text={message} size={small} color={Colors.white}/>
              <FontPoiret text={moment(date).fromNow()} size={small} color={Colors.white}/>
            </View>
          </View>
        )
      }
    }
  }

}

export default ChatCard
