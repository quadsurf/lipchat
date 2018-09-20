

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
import { FontPoiret,FontMatilde } from '../common/fonts'
import { Views,Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'

export default (props) => {
  let { family,tone,name,rgb,doesLike,finish,status,count,inventoryId } = props.color
  rgb = rgb ? `rgb(${rgb})` : Colors.purpleLight
  let medium = Texts.medium.fontSize
  let large = Texts.large.fontSize
  let larger = Texts.larger.fontSize
  let { width } = getDimensions()
  let distEditingMode = () => {
    if (count < 1 && !props.isEditing) {
      return (
        <TouchableOpacity onPress={() => props.onMinusPress(props.color,'-')}>
          <FontMatilde text="add inventory" size={larger} color={Colors.white}/>
        </TouchableOpacity>
      )
    } else {
      let height = 85
      return (
        <View style={{
          flex:1,alignItems:'center',justifyContent:'space-around',flexDirection:'row',marginTop:20
        }}>
          <TouchableOpacity
            style={{marginRight:20,height,justifyContent:'center'}}
            onPress={() => props.onMinusPress(props.color,'-')}>
              <Ionicons
                name="ios-remove-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
          <View style={{height,justifyContent:'center'}}>
            <FontMatilde text={count} size={100} color={Colors.white}/>
          </View>
          <TouchableOpacity style={{marginLeft:20,height,justifyContent:'center'}}
            onPress={() => props.onAddPress(props.color,'+')}>
              <Ionicons
                name="ios-add-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
        </View>
      )
    }
  }
  let distView = () => {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        {distEditingMode()}
      </View>
    )
  }
  let shopperView = () => {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <TouchableOpacity onPress={() => props.onLikePress(props.color)} style={{height:55}}>
          <Ionicons
            name={doesLike === true ? 'ios-heart' : 'ios-heart-outline'}
            size={60} color={Colors.white}/>
        </TouchableOpacity>
      </View>
    )
  }
  let loadingView = () => {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <FontPoiret text="loading color options . . ." size={large} color={Colors.white}/>
      </View>
    )
  }
  let editingView = () => {
    return (
      <View style={{flex:1,flexDirection:'row'}}>
        <TouchableHighlight
          underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}}
          onPress={() => props.onCancelPress(props.color)}>
            <Text style={{
              fontFamily:'Poiret',color:Colors.white,marginHorizontal:20,fontSize:25,lineHeight:30
            }}>
              cancel
            </Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={Colors.transparentWhite} style={{height:30,borderRadius:6}}
          onPress={() => props.onUpdatePress(props.color)}>
          <Text style={{
            fontFamily:'Poiret',color:Colors.white,marginHorizontal:20,fontSize:25,lineHeight:30
          }}>
            update
          </Text>
        </TouchableHighlight>
      </View>
    )
  }
  return (
    <View style={{width,height:170,backgroundColor:rgb,
        paddingBottom:4,paddingHorizontal:4,bottom:14}}>
      <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingBottom:20}}>
        <FontPoiret
          text={rgb === Colors.purpleLight ? 'could not load proper color' : ''}
          size={medium}
          color={Colors.white}/>
        <FontPoiret
          text={status === 'CURRENT' ? 'main collection' : status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'}
          size={medium}
          color={Colors.white}/>
      </View>
      {
        props.userType === 'DIST'
          ? distView()
          : props.userType === 'SHOPPER' || props.userType === 'SADVR'
          ? shopperView()
          : loadingView()
      }
      <View style={{...Views.middle,marginTop:20}}>
        {
          props.isEditing
            ? editingView()
            : <FontPoiret text={name.toUpperCase()} size={large} color={Colors.white}/>
        }
      </View>
      <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
        <FontPoiret text={`${tone.toLowerCase()} tone`} size={medium} color={Colors.white}/>
        <FontPoiret text={`${finish.toLowerCase()} finish`} size={medium} color={Colors.white}/>
      </View>
    </View>
  )
}
