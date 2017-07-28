

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class Tab2 extends Component {

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'orange'}}>
        <Text>Tab2</Text>
      </View>
    )
  }
}

export default Tab2
