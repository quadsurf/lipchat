

import React from 'react'
import { TouchableOpacity,View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
// colorId,name,rgb,onColorPress,isSelected,doesLike
export default ({ color,isSelected,doesLike,onColorPress }) => {
  let { name,rgb } = color
  let name1 = ''
  let name2 = ''
  switch(name){
    case 'dark pink':
      name2 = name
      break
    case 'first love':
      name2 = name
      break
    case 'fly girl':
      name2 = name
      break
    case 'sassy z':
      name2 = name
      break
    case 'mauve ice':
      name2 = name
      break
    case 'luv it':
      name2 = name
      break
    case 'kiss for a cause':
      name1 = 'kiss for'
      name2 = 'a cause'
      break
    case "she's apples":
      name2 = name
      break
    case 'fire opal':
      name2 = name
      break
    case 'kiss me katie':
      name2 = name
      break
    case 'honey rose':
      name2 = name
      break
    case 'fleur de lisa':
      name2 = name
      break
    case 'violet volt':
      name2 = name
      break
    case 'be mine':
      name2 = name
      break
    case 'pop art pink':
      name2 = name
      break
    default:
      name1 = name.substr(0,name.indexOf(' '))
      name2 = name.substr(name.indexOf(' ')+1)
  }
  return (
    <View 
      style={{flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}}>
      <View style={{height:60,justifyContent:'center',alignItems:'flex-end'}}>
        {
          name1.length > 0 && <FontPoiret text={name1} size={Texts.small.fontSize} color="white"/>
        }
        <FontPoiret text={name2} size={Texts.small.fontSize} color="white"/>
      </View>
      <TouchableOpacity 
        onPress={() => onColorPress(color)}
        style={{
        width:60,height:60,borderRadius:30,borderWidth:4,marginLeft:6,
        borderColor:"white",backgroundColor:`rgba(${rgb},1)`,justifyContent:'center',
        marginRight: isSelected ? 20 : 0
      }}>
        {
          isSelected && 
          <Ionicons name="ios-checkmark-outline" size={30} color="white" style={{alignSelf:'center'}} />
        }
        {
          doesLike &&
          <View style={{
            width:26,height:26,
            justifyContent:'center',alignItems:'center',position:'absolute',top:-2,right:-2
          }}>
            <Ionicons name="ios-heart" size={26} color="white" style={{
              margin:0,position:'absolute',top:-5,right:-2
            }} />
            <Ionicons name="ios-heart" size={20} color={Colors.purple} style={{
              margin:0,position:'absolute',top:-1.8,right:0.7
            }} />
          </View>
        }
      </TouchableOpacity>
    </View>
  )
}