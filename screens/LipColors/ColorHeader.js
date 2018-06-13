

import React from 'react'
import { View,TouchableOpacity } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { FontPoiret } from '../common/fonts'
import { Colors,Texts } from './../../css/Styles'
import { getDimensions } from '../../utils/Helpers'

export default ({ family,onHeaderPress,isOpen,offset }) => {
  return (
    <View style={{
      width:getDimensions().width,
      height:offset,
      backgroundColor:'transparent',
      position:'absolute',
      justifyContent:'flex-end',
      alignItems:'center'
    }}>
      <TouchableOpacity
        onPress={() => onHeaderPress(family)}
        style={{
          flexDirection:'row',
          alignItems:'flex-end'
        }}>
        <FontPoiret
          text={family}
          size={Texts.xlarge.fontSize}
          color={Colors.blue}
          style={{backgroundColor:'transparent'}}/>
        <View
          style={{width:38,justifyContent:'center',alignItems:'center'}}>
          <Ionicons
            name={isOpen ? 'md-arrow-dropdown' : 'md-arrow-dropright'}
            size={60}
            color={Colors.purple}/>
        </View>
      </TouchableOpacity>
    </View>
  )
}
