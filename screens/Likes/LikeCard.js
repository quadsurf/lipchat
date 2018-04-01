

import React from 'react'
import {
  View,
  TouchableOpacity
} from 'react-native'

// LOCALS
import { FontPoiret,FontMatilde } from '../../assets/fonts/Fonts'
import { Views,Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'

export default (props) => {
  let { status,name,tone,finish } = props.like
  let medium = Texts.medium.fontSize
  let large = Texts.large.fontSize
  let larger = Texts.larger.fontSize
  let { width } = getDimensions()
  return (
    <View style={{
      width,height:170,
      backgroundColor:props.rgb,
      paddingBottom:4,paddingHorizontal:4,bottom:14
    }}>
      <View style={{flex:1}}>
        <View style={{
          flex:1,justifyContent:'space-between',
          alignItems:'center',flexDirection:'row',
          paddingBottom:20
        }}>
          <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
          <FontPoiret text={status === 'CURRENT' ? 'main collection' : status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
        </View>
        <TouchableOpacity 
          style={Views.middle}
          onPress={() => props.onPressClaim(props.like)}>
            <FontMatilde color={Colors.white} text="request this color" size={larger} vspace={20}/>
        </TouchableOpacity>
        <View style={{...Views.middle,marginTop:20}}>
          <FontPoiret text={name.toUpperCase()} size={large} color={Colors.white}/>
        </View>
        <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
          <FontPoiret text={`${tone.toLowerCase()} tone`} size={medium} color={Colors.white}/>
          <FontPoiret text={`${finish.toLowerCase()} finish`} size={medium} color={Colors.white}/>
        </View>
      </View>
    </View>
  )
}