

import React from 'react'
import {
  View,Text,TouchableOpacity
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'

export default ({ color: { name,doesLike },onPressLike }) => {
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
          <View 
            style={{
            borderRadius:4,
            backgroundColor: Colors.transparentPurple,
            paddingHorizontal:6,
            paddingTop:2,
            paddingBottom:4
            }}>
            <FontPoiret text={name} size={Texts.small.fontSize} />
          </View>
      </TouchableOpacity>
    </View>
  )
}