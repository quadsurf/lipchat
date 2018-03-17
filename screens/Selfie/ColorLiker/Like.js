

import React from 'react'
import {
  View,Text,TouchableOpacity
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { FontPoiret } from '../../../assets/fonts/Fonts'
import { Texts } from '../../../css/Styles'

export default ({ color: { onPressLike,name,doesLike } }) => {
  return (
    <View style={{paddingHorizontal:6,flex:0.333}}>
      <TouchableOpacity 
        onPress={onPressLike}
        style={{alignItems:'center'}}>
          <Ionicons 
            name={ doesLike ? 'ios-heart' : 'ios-heart-outline' } 
            size={46} 
            color="white" 
            style={{
            marginBottom:-8
          }} />
          <FontPoiret text={name} color="white" size={Texts.small.fontSize} />
      </TouchableOpacity>
    </View>
  )
}