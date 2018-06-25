

import React from 'react'

import { View } from 'react-native'

import { Views,Colors } from '../../css/Styles'

import MyStatusBar from './StatusBar'

import { DotsLoader } from 'react-native-indicator'

export default ({ color=null }) => {
  return (
    <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
      <MyStatusBar/>
      <DotsLoader
        size={15}
        color={color || Colors.blue}
        frequency={5000}/>
    </View>
  )
}
