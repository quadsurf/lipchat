

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class AuthState extends Component {

  componentDidMount(){
    let passProps = {
      user: {
        id: '123',
        name: 'Chris'
      }
    }
    setTimeout(()=>{
      this.props.navigation.navigate('LoggedOut',passProps)
    },10000)
  }

  render() {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'purple'}}>
        <Text>AuthState</Text>
        <Text>{this.props.screenProps.localStorage.userId || 'nada'}</Text>
      </View>
    )
  }
}

export default AuthState
