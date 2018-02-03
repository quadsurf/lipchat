

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class UserMeta extends Component {

  componentDidMount(){
    let passProps = {
      user: {
        id: '123',
        name: 'Chris'
      }
    }
    setTimeout(()=>{
      this.props.navigation.navigate('LoggedIn',passProps)
    },5000)
  }

  render() {
    if (debugging) console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'yellow'}}>
        <Text>UserMeta</Text>
        <Text>{this.props.navigation.state.params.user.name}</Text>
        <Text>ID: {this.props.navigation.state.params.user.id}</Text>
      </View>
    )
  }
}

export default UserMeta
