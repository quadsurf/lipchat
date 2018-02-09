

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

export default (props) => {
  let medium = Texts.medium.fontSize
  let large = Texts.large.fontSize
  let larger = Texts.larger.fontSize
  let { width } = getDimensions()
  return (
    <View style={{width,height:170,backgroundColor:props.rgb,
        paddingBottom:4,paddingHorizontal:4,bottom:14}}>
      <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingBottom:20}}>
        <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
        <FontPoiret text={props.status === 'CURRENT' ? 'main collection' : props.status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
      </View>
      {
        props.userType === 'DIST' ?
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          {
            props.inventoryCount < 1 && !props.isEditing ?
            <TouchableOpacity onPress={props.onMinusPress}>
              <FontMatilde text="add inventory" size={larger} color={Colors.white}/>
            </TouchableOpacity> :
            <View style={{flex:1,alignItems:'center',justifyContent:'space-around',flexDirection:'row',marginTop:20}}>
              <TouchableOpacity style={{marginRight:20}} onPress={props.onMinusPress}>
                <Ionicons name="ios-remove-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
              </TouchableOpacity>
              <FontMatilde text={props.inventoryCount} size={100} color={Colors.white}/>
              <TouchableOpacity style={{marginLeft:20}} onPress={props.onAddPress}>
                <Ionicons name="ios-add-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
              </TouchableOpacity>
            </View>
          }
        </View> :
        props.userType === 'SHOPPER' ?
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <TouchableOpacity onPress={props.onLikePress}>
            <Ionicons name={props.doesLike === true ? 'ios-heart' : 'ios-heart-outline'} size={60} color={Colors.white}/>
          </TouchableOpacity>
        </View> :
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <FontPoiret text="loading color options . . ." size={large} color={Colors.white}/>
        </View>
      }
      <View style={{...Views.middle,marginTop:20}}>
        {
          props.isEditing ?
          <View style={{flex:1,flexDirection:'row'}}><TouchableHighlight underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}} onPress={props.onCancelPress}><Text style={{fontFamily:'Poiret',color:Colors.white,marginHorizontal:20,fontSize:25,lineHeight:30}}>cancel</Text></TouchableHighlight><TouchableHighlight underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}} onPress={props.onUpdatePress}><Text style={{fontFamily:'Poiret',color:Colors.white,marginHorizontal:20,fontSize:25,lineHeight:30}}>update</Text></TouchableHighlight></View> :
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