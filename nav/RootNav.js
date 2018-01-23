

import { Notifications } from 'expo'
import React, { Component } from 'react'

// LIBS
import { StackNavigator } from 'react-navigation'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync'

// SCREENS
import AuthState from '../screens/AuthState'
import Login from '../screens/Login'
import UserMeta  from '../screens/UserMeta'
import TabNav from './TabNav'
import Messages from '../screens/Chat/Messages'
import Claims from '../screens/Likes/Claims'

// const LoggedOutStack = StackNavigator(
//   {
//     Login: { screen:Login },
//     UserMeta: { screen:UserMeta }
//   },
//   {
//     initialRouteName: 'Login',
//     headerMode: 'none'
//   }
// )
//
// const LoggedInStack = StackNavigator(
//   {
//     TabNav: { screen:TabNav }
//   },
//   {
//     headerMode: 'none',
//     mode: 'modal',
//     direction: 'bottomToTop'
//   }
// )

const ClaimsNavigator = StackNavigator(
  {
    Root: { screen:Claims }
  },
  {
    initialRouteName: 'Root',
    headerMode: 'none',
    mode: 'modal',
    direction: 'bottomToTop',
    navigationOptions: {
      gesturesEnabled: true
    }
  }
)

const RootStack = StackNavigator(
  {
    Root: { screen:AuthState },
    LoggedOut: { screen:Login },
    LoggedIn: { screen:TabNav },
    Messages: { screen:Messages },
    Claims: { screen:ClaimsNavigator }
  },
  {
    initialRouteName: 'Root',
    headerMode: 'none'
  }
)

export default class RootNav extends Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications()
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove()
  }

  render() {
    return <RootStack screenProps={this.props.localStorage} />
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync()

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    )
  }

  _handleNotification = ({ origin, data }) => {
    // console.log(
    //   `Push notification ${origin} with data: ${JSON.stringify(data)}`
    // )
  }
}
