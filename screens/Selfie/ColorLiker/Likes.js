

import React from 'react'
import {
  View
} from 'react-native'

import Like from './Like'

export default ({ colors }) => colors.map( color => <Like key={color.colorId} color={color} />)