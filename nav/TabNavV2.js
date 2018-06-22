

import React, { PureComponent } from 'react'
import { Animated,View,Text } from 'react-native'

//LIBS
import { connect } from 'react-redux'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import { Ionicons,Entypo,MaterialCommunityIcons,FontAwesome } from '@expo/vector-icons'
import { DotsLoader } from 'react-native-indicator'
import PropTypes from 'prop-types'
import type { NavigationState } from 'react-native-tab-view/types'

//SCREENS
import Likes from '../screens/Likes/Preloader'
import Chat from '../screens/Chat/Preloader'
import Selfie from '../screens/Selfie/Preloader'
import LipColors from '../screens/LipColors/Preloader'
import You from '../screens/You/Preloader'

//LOCALS
import { Views,Colors } from '../css/Styles'
import styles from './Styles'

//COMPs
import Loading from '../screens/common/Loading'

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
    index: 3,
    routes: [
      { key: '0', title: 'FAVORITES', icon: 'star' },
      { key: '1', title: 'CHAT', icon: 'chat' },
      { key: '2', title: 'SELFIE', icon: 'camera' },
      { key: '3',
        title: this.props.userType === 'SHOPPER' ? 'COLORS' : 'INVENTORY',
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

  renderLabel = ({ route,index }) => (
    <Text style={
      route.key == this.state.index ? styles.labelActive : styles.labelInactive
    }>
      {route.title}
    </Text>
  )

  renderFooter = props => (
    <TabBar
      {...props}
      renderIcon={this.renderIcon}
      renderBadge={this.renderBadge}
      renderIndicator={this.renderIndicator}
      style={styles.tabbar}
      tabStyle={styles.tab}
      renderLabel={this.renderLabel}
      useNativeDriver
    />
  )

  renderScene = ({ route,focused }) => {
    if (Math.abs(this.state.index - this.state.routes.indexOf(route)) > 0) {
      return <Loading/>
    }
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
        return (
          <Chat
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
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
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderFooter={this.renderFooter}
        onIndexChange={this.handleChangeTab}
        initialLayout={{
          width: this.props.wWidth,
          height: this.props.wHeight
        }}
      />
    )
  }

}

TabNav.propTypes = {
  userType: PropTypes.string.isRequired,
  unreadCount: PropTypes.number.isRequired,
  chats: PropTypes.array.isRequired,
  wWidth: PropTypes.number.isRequired,
  wHeight: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  userType: state.user.type,
  unreadCount: state.unreadCount,
  chats: state.chats,
  wWidth: state.settings.screenWidth,
  wHeight: state.settings.screenHeight
})

export default connect(mapStateToProps)(TabNav)
