

import { Notifications } from 'expo'
import React, { Component } from 'react'

// LIBS
import { StackNavigator } from 'react-navigation'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync'
import { Colors } from '../css/Styles'

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
  state = {
    isConnected: false
  }
  
  componentWillMount(){
    // this.setState({isConnected:this.props.isConnected})
  }
  
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications()
  }
  
  componentWillReceiveProps(newProps){
    return
    // code below is to resurrect network monitoring
    let { isConnected } = this.state
    if (newProps.isConnected !== isConnected) {
      if (isConnected === true && newProps.isConnected === false) {
        this.setState({isConnected:'offline'})
      } else {
        this.setState({isConnected:newProps.isConnected})
      }
    }
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove()
  }

  render() {
    return <RootStack screenProps={this.props.localStorage} />
    // code below is to resurrect network monitoring
    let { localStorage,connectionType } = this.props
    let { isConnected } = this.state
    if (isConnected || isConnected === 'offline') {
      return <RootStack screenProps={localStorage} />
    } else {
      return (
        <DotsLoader
          size={15}
          color={Colors.pinkly}
          frequency={5000}/>
      )
    }
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
