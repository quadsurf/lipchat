
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'

// LIBS
import { Ionicons } from '@expo/vector-icons'

// LOCALS
import { FontPoiret,FontMatilde } from '../../assets/fonts/Fonts'
import { Views,Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'

//CONSTS
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()

export default ColorCard = props => {
  return (
    <View style={{width:screen.width,height:170,backgroundColor:props.rgb,
        paddingBottom:4,paddingHorizontal:4}}>
      <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingBottom:20}}>
        <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
        <FontPoiret text={props.status === 'CURRENT' ? 'main collection' : props.status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
      </View>
      {
        props.distributorId ?
        <View style={{flex:1,alignItems:'center',justifyContent:'space-around',flexDirection:'row',marginTop:20}}>
          <TouchableOpacity style={{marginLeft:40}} onPress={props.onMinusPress}>
            <Ionicons name="ios-remove-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
          <FontMatilde text={props.inventoryCount} size={100} color={Colors.white}/>
          <TouchableOpacity style={{marginRight:40}} onPress={props.onAddPress}>
            <Ionicons name="ios-add-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
        </View> : null
      }
      <View style={{...Views.middle,marginTop:20}}>
        {
          props.isEditing ?
          <View style={{flex:1,flexDirection:'row'}}><TouchableHighlight underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}} onPress={props.onCancelPress}><Text style={{fontFamily:'Poiret',color:Colors.white,textDecorationLine:'underline',marginHorizontal:20,fontSize:25,lineHeight:30}}>cancel</Text></TouchableHighlight><TouchableHighlight underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}} onPress={props.onUpdatePress}><Text style={{fontFamily:'Poiret',color:Colors.white,textDecorationLine:'underline',marginHorizontal:20,fontSize:25,lineHeight:30}}>update</Text></TouchableHighlight></View> :
          <FontPoiret text={props.name.toUpperCase()} size={large} color={Colors.white}/>
        }
      </View>
      <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
        <FontPoiret text={`${props.tone.toLowerCase()} tone`} size={medium} color={Colors.white}/>
        <FontPoiret text={`${props.finish.toLowerCase()} finish`} size={medium} color={Colors.white}/>
      </View>
    </View>
  )
}
