

import React from 'react'
import { TouchableOpacity } from 'react-native'

import PropTypes from 'prop-types'

import { Ionicons,EvilIcons,MaterialIcons } from '@expo/vector-icons'
import { Colors } from '../../css/Styles'


const Icon = ({ onPressIcon=null,family,name,size=null,color=null,styles={} }) => {
  let style = {
    color: color || Colors.blue,
    margin: 0,
    padding: 0,
    ...styles
  }
  let icons = () => {
    {
      switch(family){
        case 'Ionicons':
            //ios-information-circle-outline
            return (
              <Ionicons
                name={name}
                size={size || 20}
                style={style}/>
            )
        case 'MaterialIcons':
            //phone
            return (
              <MaterialIcons
                name={name}
                size={size || 20}
                style={style}/>
            )
        case 'EvilIcons':
            return (
              <EvilIcons
                name={name}
                size={size || 20}
                style={style}/>
            )
        default: return null
      }
    }
  }
  if (onPressIcon) {
    return (
      <TouchableOpacity onPress={onPressIcon}>
        { icons() }
      </TouchableOpacity>
    )
  } else {
    return icons()
  }
}

Icon.propTypes = {
  onPressIcon: PropTypes.func,
  family: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
  styles: PropTypes.object
}

export default Icon

// "ios-information-circle-outline"
