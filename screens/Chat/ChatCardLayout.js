

import React from 'react'
import {
  View,Image,TouchableOpacity
} from 'react-native'

//LIBS
import moment from 'moment'
import { Foundation } from '@expo/vector-icons'

// LOCALS
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
import { getDimensions,clipText } from '../../utils/Helpers'

// CONSTs
const size = 90

const ChatCardLayout = props => {
  let { chatId,approved,uri,chatTitle,chatSubTitle,message,date,line1,line2,nav } = props
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
  let textWidth = width-size-20
  if (approved) {
    // the person being viewed is approved
    return (
      <TouchableOpacity style={cardStyle} onPress={()=>{
          nav.navigate('Messages',{nav,chatId,uri,chatTitle})
          // console.log('chatId',chatId);
        }}>
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

export default ChatCardLayout
