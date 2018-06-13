

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'

// LIBS
import { Ionicons,FontAwesome } from '@expo/vector-icons'

// LOCALS
import { FontPoiret,FontMatilde } from './fonts'
import { Views,Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'

//CONSTS
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()

const LinkButton = ({ onPress,text }) => {
  return (
    <TouchableHighlight underlayColor={Colors.transparentWhite} style={{borderRadius:6,marginVertical:20,paddingHorizontal:20,paddingVertical:10}} onPress={onPress}>
      <Text style={{
          fontFamily:'Poiret',color:Colors.blue,fontSize:large
        }}>{text}</Text>
    </TouchableHighlight>
  )
}

const CardLine = ({ width }) => {
  return (
    <View style={{width,height:15,backgroundColor:Colors.transparentWhite,borderRadius:14,marginVertical:3}}></View>
  )
}

const CardLines = ({ style }) => {
  return (
    <View style={style}>
      <CardLine width={125}/>
      <CardLine width={100}/>
      <CardLine width={110}/>
      <CardLine width={140}/>
    </View>
  )
}

const Switch = ({ checked,onSwitchPress }) => {
  return (
    <TouchableOpacity style={{
      width:40,height:40,backgroundColor:'transparent',marginLeft:10,
      marginRight:8,justifyContent:'center',alignItems:'center'
    }}
      onPress={onSwitchPress}>
      <View
        style={{
          width:40,height:12,backgroundColor:Colors.transparentWhite,
          borderRadius:20,alignItems:checked?'flex-end':'flex-start'
        }}>
        <View style={{
          width:20,height:20,borderRadius:10,
          backgroundColor:checked?Colors.pinkly:Colors.blue,top:-4
        }}/>
      </View>
    </TouchableOpacity>
  )
}

export {
  LinkButton,CardLines,Switch
}
