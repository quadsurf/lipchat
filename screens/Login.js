

import React, { Component } from 'react'
import {
  View,
  Text
} from 'react-native'

class Login extends Component {

  state = {
    passProps: {
      user: {
        id: '456',
        name: 'Chels'
      }
    }
  }

  componentDidMount(){
    let passProps = {
      user: {
        id: '123',
        name: 'Chris'
      }
    }
    // setTimeout(()=>{
    //   this.props.navigation.navigate('UserMeta',passProps)
    // },5000)
  }

  updateUser(){
    this.props.navigation.setParams(this.state.passProps)
  }

  render() {
    console.log(this.props.navigation);
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'orange'}}>
        <Text onPress={() => this.updateUser()}>Login</Text>
        <Text>{this.props.navigation.state.params.user.name}</Text>
        <Text>ID: {this.props.navigation.state.params.user.id}</Text>
      </View>
    )
  }
}

export default Login
