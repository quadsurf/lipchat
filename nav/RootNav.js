

import { Notifications } from 'expo'
import React, { Component } from 'react'

// LIBS
import { StackNavigator } from 'react-navigation'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync'

// SCREENS
import AuthState from '../screens/Auth/AuthState'
import Login from '../screens/Auth/Login'
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
