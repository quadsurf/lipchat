

import React, { Component } from 'react'
import { Text } from 'react-native'

//LOCALS
import { Colors,Texts } from '../../css/Styles'

const FontMatilde = props => (
  <Text
    {...props}
    style={[props.style, {
      fontFamily: 'Matilde',
      fontSize: props.size || Texts.xlarge.fontSize,
      color: props.color || Colors.blue,
      textDecorationLine: props.underline ? 'underline' : 'none',
      backgroundColor: 'transparent'
    }]}
    allowFontScaling={false}
    selectable={true}
    numberOfLines={1}>
    {props.text}
  </Text>
)

const FontPoiret = props => (
  <Text
    {...props}
    style={[props.style, {
      fontFamily: 'Poiret',
      fontSize: props.size || Texts.xlarge.fontSize,
      color: props.color || Colors.blue,
      textDecorationLine: props.underline ? 'underline' : 'none',
      paddingVertical: props.vspace || 0,
      backgroundColor: 'transparent'
    }]}
    allowFontScaling={false}
    selectable={true}
    numberOfLines={1}>
    {props.text}
  </Text>
)

export {
  FontMatilde,FontPoiret
}
