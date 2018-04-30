

import React, { Component } from 'react'

// LIBS
import { StackNavigator } from 'react-navigation'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import { Colors } from '../css/Styles'

// SCREENS
import AuthState from '../screens/Auth/AuthStateV2'
import Login from '../screens/Auth/LoginV2'
import TabNav from './TabNav'
import Messages from '../screens/Chat/Messages'
import Claims from '../screens/Likes/Claims'

const ClaimsModal = StackNavigator(
  {
    ClaimsModalIndex: { screen:Claims }
  },
  {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: true
    }
  }
)

const AppStack = StackNavigator(
  {
    AppStackIndex: { screen:AuthState },
    LoggedOut: { screen:Login },
    LoggedIn: { screen:TabNav },
    Messages: { screen:Messages }
  },
  {
    initialRouteName: 'AppStackIndex',
    headerMode: 'none'
  }
)

const RootStack = StackNavigator(
  {
    AppStack: { screen:AppStack },
    Claims: { screen:ClaimsModal }
  },
  {
    initialRouteName: 'AppStack',
    mode: 'modal',
    headerMode: 'none'
  }
)

export default class RootNav extends Component {
  state = {
    // isConnected: false
  }
  
  componentWillMount(){
    // this.setState({isConnected:this.props.isConnected})
  }
  
  componentDidMount(){
    // console.log('localStorage on RootNav',this.props.localStorage);
  }
   // screenProps={this.props.localStorage}
  render() {
    return <RootStack/>
  }
}
