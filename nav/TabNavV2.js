

import React, { PureComponent } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

//LIBS
import { Ionicons,Entypo,MaterialCommunityIcons,FontAwesome } from '@expo/vector-icons'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import type { NavigationState } from 'react-native-tab-view/types'

//SCREENS
import Likes from '../screens/Likes/Likes'
import Chat from '../screens/Chat/Chat'
import Selfie from '../screens/Selfie/Selfie'
import LipColors from '../screens/LipColors/LipColors'
import You from '../screens/You/You'

//LOCALS
import { Views,Colors } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import styles from './Styles'

//CONSTs
const debugging = __DEV__ && false

type Route = {
  key: string,
  title: string,
  icon: string
}

type State = NavigationState<Route>;

class TabNav extends PureComponent<void, *, State> {

  state: State = {
    index: 4,
    routes: [
      { key: '0', title: 'FAVORITES', icon: 'star' },
      { key: '1', title: 'CHAT', icon: 'chat' },
      { key: '2', title: 'SELFIE', icon: 'camera' },
      { key: '3', 
        title: this.props.user.type === 'SHOPPER' ? 'COLOR FAMILIES' : 'INVENTORY',
        icon: 'ios-color-palette' },
      { key: '4', title: 'YOU', icon: 'account' }
    ],
    unreadCount: this.props.unreadCount
  }

  handleChangeTab = index => {
    this.setState({index})
  }

  renderIndicator = props => {
    const { width,position } = props

    const translateX = Animated.multiply(position, width)

    return (
      <Animated.View style={[styles.container, { width, transform: [{ translateX }] }]}>
        <View style={styles.indicator} />
      </Animated.View>
    )
  }

  renderIcon = ({ route,focused }) => {
    let { iconActive,iconInactive,favSpacer } = styles
    switch(route.key){
      case '0':
        return <FontAwesome name={route.icon} size={30} style={
            route.key == this.state.index ? [iconActive,favSpacer] : [iconInactive,favSpacer]
          }/>
      case '1':
        return <Entypo name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
      case '2':
        return <Entypo name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
      case '4':
        return <MaterialCommunityIcons name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
      default:
        return <Ionicons name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
    }

  }

  renderBadge = ({ route }) => {
    if (
      route.key === '1' && 
      this.props.chats && 
      this.props.chats.length > 0
    ) {
      let newUnreadCount = this.props.chats.reduce((accumulator, {unreadCount}) => accumulator + unreadCount, 0)
      if (newUnreadCount > 0) {
        return (
          <View style={styles.badge}>
            <Text style={styles.count}>{newUnreadCount}</Text>
          </View>
        )
      } else {
        return <View/>
      }
    } else {
      return <View/>
    }
  }

  renderLabel = ({ route,index }) => {
    return (
      <Text style={
        route.key == this.state.index ? styles.labelActive : styles.labelInactive
      }>
        {route.title}
      </Text>
    )
  }

  renderFooter = props => {
    // let { deviceYearClass:year } = Constants
    // if (year >= 2018) {
      return (
        <TabBar
          {...props}
          renderIcon={this.renderIcon}
          renderBadge={this.renderBadge}
          renderIndicator={this.renderIndicator}
          style={styles.tabbar}
          tabStyle={styles.tab}
          renderLabel={this.renderLabel}
        />
      )
    // } else {
    //   return null
    // }
  }

  renderScene = ({ route,focused }) => {
    switch (route.key) {
      case '0':
        return (
          <Likes
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      case '1':
        if (this.state.notificationsHasShopper && this.state.user2AdminDmExists) {
          return (
            <Chat
              state={this.state}
              focused={focused}
              tabRoute={route}
            />
          )
        } else {
          return (
            <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
              <DotsLoader
                size={15}
                color={Colors.blue}
                frequency={5000}/>
            </View>
          )
        }
      case '2':
        return (
          <Selfie
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      case '3':
        return (
          <LipColors
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      case '4':
        return (
          <You
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      default:
        return (
          <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
            <Text style={{color:Colors.blue}}>Tab Failed to Load</Text>
          </View>
        )
    }
  }

  render() {
    return (
      <TabViewAnimated
        style={[styles.container,this.props.style]}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderFooter={this.renderFooter}
        onIndexChange={this.handleChangeTab}
      />
    )
  }

}
