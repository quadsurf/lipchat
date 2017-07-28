

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class TabNav extends Component {

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'green'}}>
        <Text>TabNav</Text>
        <Text>{this.props.navigation.state.params.user.name}</Text>
        <Text>ID: {this.props.navigation.state.params.user.id}</Text>
      </View>
    )
  }
}

export default TabNav
