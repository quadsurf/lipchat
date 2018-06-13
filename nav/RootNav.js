

import React, { Component } from 'react'

// LIBS
import { createSwitchNavigator,createStackNavigator } from 'react-navigation'
// import isIPhoneX from 'react-native-is-iphonex'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import { Colors } from '../css/Styles'

// SCREENS
import AuthState from '../screens/Auth/AuthState'
import Login from '../screens/Auth/Login'
import TabNav from './TabNav'
import Messages from '../screens/Chat/Messages'
import Claims from '../screens/Likes/Claims'
import RemoteData from '../store/Remote'
import WebView from '../screens/common/WebView'

const ClaimsModal = createStackNavigator(
  { Claims },
  {
    headerMode: 'none',
    navigationOptions: { gesturesEnabled: true }
  }
)

const WebViewModal = createStackNavigator(
  { WebView },
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
    Claims: ClaimsModal,
    WebView: WebViewModal
  },
  {
    initialRouteName: 'Preloader',
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: { gesturesEnabled: false },
  	// transitionConfig: () => {
  	// 	if (!isIPhoneX) {
    //     return {
    //       containerStyle: { marginTop: -20 }
    //     }
    //   }
  	// }
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
