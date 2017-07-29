

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class TabNav extends Component {

  render() {
    let { user } = this.props.navigation.state.params
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'green'}}>
        <Text>TabNav</Text>
        <Text>{user.fbkFirstName} {user.fbkLastName}</Text>
        <Text>ID: {user.id}</Text>
        <Text>Less Friends:</Text>
        { user.fbkFriends.map( friend => <Text key={friend.id}>- {friend.name}</Text> ) }
      </View>
    )
  }
}

export default TabNav
