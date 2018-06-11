

import React from 'react'

import { SafeAreaView,View } from 'react-native'

import { Views,Colors } from '../css/Styles'

import MyStatusBar from './MyStatusBar'

import { DotsLoader } from 'react-native-indicator'

export default () => {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:Colors.bgColor}}>
      <View style={{...Views.middle,backgroundColor:'transparent'}}>
        <MyStatusBar/>
        <DotsLoader
          size={15}
          color={Colors.blue}
          frequency={5000}/>
      </View>
    </SafeAreaView>
  )
}
