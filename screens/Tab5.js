

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class Tab5 extends Component {

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'blue'}}>
        <Text>Tab5</Text>
      </View>
    )
  }
}

export default Tab5
