

import React from 'react'
import { TouchableOpacity,View } from 'react-native'

import { FontPoiret } from '../../assets/fonts/Fonts'
import { Texts } from '../../css/Styles'

export default ({ name,rgb,onPressColor }) => {
  return (
    <TouchableOpacity 
      onPress={onPressColor}
      style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
      <FontPoiret text={name} size={Texts.small.fontSize} color="white"/>
      <View style={{
        width:60,height:60,borderRadius:30,borderWidth:4,marginLeft:6,
        borderColor:'white',backgroundColor:`rgba(${rgb},1)`
      }} />
    </TouchableOpacity>
  )
}