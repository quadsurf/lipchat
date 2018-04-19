

import React from 'react'
import { Text,View,Image } from 'react-native'

// LIBS
import { DotsLoader } from 'react-native-indicator'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

// LOCALS
import { Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { getDimensions } from '../../utils/Helpers'

// CONSTs
const screen = getDimensions()
const avatarSize = 50
const medium = Texts.medium.fontSize
const width = screen.width > 400 ? screen.width*.835 : (screen.width*.835)-12
const date1 = {
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 2
}
const msgStyle1 = {
  width,flexDirection:'row',backgroundColor:'transparent',
  borderRadius:6,borderWidth:1,padding:14
}
const avatarLeft = {
  left: 0
}
const avatarRight = {
  right: 0
}
const triBorder = screen.width*.0125
const tri = {
  left: 0,
  top: 21,
  width: 0,
  height: 0,
  borderTopColor: 'transparent',
  borderTopWidth: triBorder,
  borderBottomWidth: triBorder,
  borderBottomColor: 'transparent'
}
const triLeft = {
  borderRightWidth: triBorder*2
}
const triLeftPink = {
  borderRightColor: Colors.pinkly
}
const triLeftBlue = {
  borderRightColor: Colors.blue
}
const triRight = {
  borderLeftWidth: triBorder*2
}
const triRightPink = {
  borderLeftColor: Colors.pinkly
}
const triRightBlue = {
  borderLeftColor: Colors.blue
}
const spacer = {
  flex:1,marginVertical:10
}

// COMPONENTS
const Message = props => {
  let { text,userId,writer,updated,level,audience,chatType,sent } = props
  let uri = writer.type === 'DIST' && writer.distributorx.logoUri && writer.distributorx.logoUri.length > 8 ? writer.distributorx.logoUri : `https://graph.facebook.com/${writer.fbkUserId}/picture?width=${avatarSize}&height=${avatarSize}`
  let position = userId !== writer.id ? 'left' : 'right'
  let date2 = { alignItems: position === 'left' ? 'flex-end' : 'flex-start' }
  let msgStyle2 = { borderColor: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly }
  if (text === 'isTypingNow') {
    if (position === 'left') {
      return (
        <View style={spacer}>
          <View style={[date1,date2]}>
            <FontPoiret text={`${writer.fbkFirstName || ''} ${writer.fbkLastName || ''} is typing now...`} size={12} color={Colors.transparentWhite}/>
          </View>
          <View style={{flexDirection:'row',justifyContent: 'flex-start'}}>
            <View style={{flexDirection:'row'}}>
              <Image source={{uri}} style={{width:avatarSize,height:avatarSize,borderRadius:6}}/>
              <View style={[tri,triLeft,writer.type === 'SHOPPER' ? triLeftBlue : triLeftPink]} />
            </View>
            <View style={[{alignItems:'center'},msgStyle1,msgStyle2,avatarLeft]}>
              <DotsLoader
                size={10}
                color={writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly}
                frequency={5000}/>
            </View>
          </View>
        </View>
      )
    } else {
      return null
    }
  } else {
    return (
      <View style={{flex:1,marginVertical:10}}>
        <View style={[date1,date2]}>
          <FontPoiret 
            text={`${writer.fbkFirstName || ''} ${writer.fbkLastName || ''} - ${moment(updated).fromNow()}${level === 'A' && chatType === 'SADVR2ALL' ? ` - To: ${audience}` : ''}`} 
            size={12} 
            color={Colors.transparentWhite}/>
        </View>
        <View style={{flexDirection:'row',justifyContent: position === 'left' ? 'flex-start' : 'flex-end'}}>
          {
            position === 'left' ?
            <View style={{flexDirection:'row'}}>
              <Image source={{uri}} style={{width:avatarSize,height:avatarSize,borderRadius:6}}/>
              <View style={[tri,triLeft,writer.type === 'SHOPPER' ? triLeftBlue : triLeftPink]} />
            </View> : null
          }
          <View style={[msgStyle1,msgStyle2,position === 'left' ? avatarLeft : avatarRight,{flexDirection:'column'}]}>
            <Text 
              style={[{fontFamily:'Poiret',fontSize:medium,color: writer.type === 'SHOPPER' ? Colors.blue : Colors.pinkly}]}
              allowFontScaling={false}
              selectable={true}>
                {text}
            </Text>
            {
              sent === false && <FontPoiret text="not delivered, please try resending" size={12} color={Colors.red} />
            }
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
}

export default Message