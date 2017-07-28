

import React from 'react'
import { Platform,View,StatusBar } from 'react-native'
import { Colors } from '../css/Styles'

const MyStatusBar = props => {
  if (props.hidden) {
    return (
      <View>
        {Platform.OS === 'ios' && <StatusBar hidden={true} />}
        {Platform.OS === 'android' && <View style={{
          height: 24,
          backgroundColor: Colors.bgColor
        }} />}
      </View>
    )
  } else {
    return (
      <View>
        {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
        {Platform.OS === 'android' && <View style={{
          height: 24,
          backgroundColor: Colors.bgColor
        }} />}
      </View>
    )
  }

}

export default MyStatusBar
