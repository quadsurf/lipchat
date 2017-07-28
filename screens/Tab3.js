

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class Tab3 extends Component {

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'yellow'}}>
        <Text>Tab3</Text>
      </View>
    )
  }
}

export default Tab3
