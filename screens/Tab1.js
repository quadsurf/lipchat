

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class Tab1 extends Component {

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'red'}}>
        <Text>Tab1</Text>
      </View>
    )
  }
}

export default Tab1
