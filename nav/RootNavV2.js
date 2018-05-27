

import React, { Component } from 'react'

// LIBS
import { createSwitchNavigator,createStackNavigator } from 'react-navigation'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import { Colors } from '../css/Styles'

// SCREENS
import AuthState from '../screens/Auth/AuthStateV2'
import Login from '../screens/Auth/LoginV2'
import TabNav from './TabNav'
import Messages from '../screens/Chat/Messages'
import Claims from '../screens/Likes/Claims'
import RemoteData from '../store/Remote'

// const AuthStack = createStackNavigator(
//   { LoggedOut: Login },
//   { headerMode: 'none' }
// )

const ClaimsModal = createStackNavigator(
  { Claims },
  {
    headerMode: 'none',
    navigationOptions: { gesturesEnabled: true }
  }
)

const TabStack = createStackNavigator(
  {
    TabNav,
    Messages
  },
  { headerMode: 'none' }
)

const AppStack = createStackNavigator(
  {
    Preloader: RemoteData,
    Tabs: TabStack,
    Claims: ClaimsModal
  },
  {
    initialRouteName: 'Preloader',
    mode: 'modal',
    headerMode: 'none'
  }
)

export default createSwitchNavigator(
  {
    AuthChecker: AuthState,
    LoggedOut: Login,
    LoggedIn: AppStack
  },
  {
    initialRouteName: 'AuthChecker',
    headerMode: 'none'
  }
)