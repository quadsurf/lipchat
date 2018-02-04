
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
import { FontPoiret,FontMatilde } from '../assets/fonts/Fonts'
import { Views,Colors,Texts } from '../css/Styles'
import { getDimensions } from '../utils/Helpers'

//CONSTS
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()

const ColorCard = props => {
  return (
    <View style={{width:screen.width,height:170,backgroundColor:props.rgb,
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
              <FontPoiret text="add inventory" size={large} color={Colors.white}/>
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

const LikeCard = props => {
  let { status,name,tone,finish } = props.like
  return (
    <View style={{
      width:screen.width,height:170,
      backgroundColor:props.rgb,
      paddingBottom:4,paddingHorizontal:4,bottom:14
    }}>
      <TouchableOpacity style={{flex:1}} onPress={props.onPressClaim}>
        <View style={{
          flex:1,justifyContent:'space-between',
          alignItems:'center',flexDirection:'row',
          paddingBottom:20
        }}>
          <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
          <FontPoiret text={status === 'CURRENT' ? 'main collection' : status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
        </View>
        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <FontMatilde color={Colors.white} text="request this color" size={44} vspace={20}/>
        </View>
        <View style={{...Views.middle,marginTop:20}}>
          <FontPoiret text={name.toUpperCase()} size={large} color={Colors.white}/>
        </View>
        <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
          <FontPoiret text={`${tone.toLowerCase()} tone`} size={medium} color={Colors.white}/>
          <FontPoiret text={`${finish.toLowerCase()} finish`} size={medium} color={Colors.white}/>
        </View>
      </TouchableOpacity>
    </View>
  )
}
// <FontAwesome name="star-o" size={50} color={Colors.white}/>
const MyButton = props => {
  return (
    <TouchableHighlight underlayColor={Colors.transparentWhite} style={{borderRadius:6,marginVertical:20,paddingHorizontal:20,paddingVertical:10}} onPress={props.onPress}>
      <Text style={{
          fontFamily:'Poiret',color:Colors.blue,fontSize:large
        }}>{props.text}</Text>
    </TouchableHighlight>
  )
}

const CardLine = props => {
  return (
    <View style={{width:props.width,height:15,backgroundColor:Colors.transparentWhite,borderRadius:14,marginVertical:3}}></View>
  )
}

const CardLines = props => {
  return (
    <View style={props.style}>
      <CardLine width={125}/>
      <CardLine width={100}/>
      <CardLine width={110}/>
      <CardLine width={140}/>
    </View>
  )
}

const Switch = ({checked,onSwitchPress}) => {
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
  ColorCard,LikeCard,MyButton,CardLines,Switch
}
