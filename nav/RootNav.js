

import React from 'react'
import { View,Text } from 'react-native'

// LIBS
import { createSwitchNavigator,createStackNavigator } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import { Colors } from '../css/Styles'
import styles from './Styles'

// SCREENS
import AuthState from '../screens/Auth/AuthState'
import Login from '../screens/Auth/Login'
// import TabNav from './TabNav'
import Messages from '../screens/Chat/Messages'
import Claims from '../screens/Likes/Claims'
import RemoteData from '../store/Remote'
import WebView from '../screens/common/WebView'

// TAB SCREENS
import Likes from '../screens/Likes/Preloader'
import Chat from '../screens/Chat/Preloader'
import Selfie from '../screens/Selfie/Preloader'
import LipColors from '../screens/LipColors/Preloader'
import You from '../screens/You/Preloader'

// COMPs
import Icon from '../screens/common/Icon'

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

const TabStack = createMaterialBottomTabNavigator(
  {
    Likes,
    Chat,
    Selfie,
    LipColors,
    You
  },
  {
    shifting: false,
    initialRouteName: 'Selfie',
    order: ['Likes','Chat','Selfie','LipColors','You'],
    activeTintColor: styles.labelActive.color,
    inactiveTintColor: styles.labelInactive.color,
    barStyle: styles.tabbar,
    // style: styles.tab,
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        let { routeName } = navigation.state
        let { iconActive,iconInactive,labelActive,labelInactive } = styles
        let iconFamily,iconName
        switch(routeName){
          case 'Likes':
              iconFamily = 'FontAwesome'
              iconName = 'star'
              break
          case 'Chat':
              iconFamily = 'Entypo'
              iconName = 'chat'
              break
          case 'Selfie':
              iconFamily = 'Entypo'
              iconName = 'camera'
              break
          case 'LipColors':
              iconFamily = 'Ionicons'
              iconName = 'ios-color-palette'
              break
          case 'You':
              iconFamily = 'MaterialCommunityIcons'
              iconName = 'account'
              break
          default: return null
        }

        let tab = () => (
          <View
            style={styles.tab}>
            <Icon
              family={iconFamily}
              name={iconName}
              size={30}
              styles={
                focused ? iconActive : iconInactive
              }/>
            <Text
              style={focused ? labelActive : labelInactive}>
              { routeName.toUpperCase() }
            </Text>
          </View>
        )

        if (focused) {
          return (
            <View style={styles.container}>
              <View style={styles.indicator}>
                { tab() }
              </View>
            </View>
          )
        } else {
          return tab()
        }
      },
      // tabBarOptions: props => {
      //   console.log('props')
      //   return {
      //     activeTintColor: '#e91e63'
      //   }
      //   console.log('focused',focused)
      //   let { routeName } = navigation.state
      //   console.log('routeName',routeName)
      //   return {}
      //   return (
      //     <Text
      //       style={
      //         focused ? styles.labelActive : styles.labelInactive
      //       }>
      //       { routeName }
      //     </Text>
      //   )
      // }
    }),
    // tabBarOptions: {
    //   activeTintColor: Colors.pinkly
    //   // labelStyle: focused ? styles.labelActive : styles.labelInactive
    // }
  }
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
