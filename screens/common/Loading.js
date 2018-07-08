

import React from 'react'

import { View } from 'react-native'

import { Views,Colors,Texts } from '../../css/Styles'

import MyStatusBar from './StatusBar'

import { DotsLoader } from 'react-native-indicator'

import { FontPoiret } from './fonts'

export default ({ color=null,text=null }) => {
  return (
    <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
      <MyStatusBar/>
      {
        text && (
          <FontPoiret
            text={text}
            color={Colors.blue}
            size={Texts.larger.fontSize}
            style={{marginBottom:30}}/>
        )
      }
      <DotsLoader
        size={15}
        color={color || Colors.blue}
        frequency={5000}/>
    </View>
  )
}
