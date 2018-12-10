

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
import Signup from '../screens/Auth/Signup'
import Selfie from '../screens/Selfie/Preloader'
import LipColors from '../screens/LipColors/LipColorsGuest'

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

class TabNavGuest extends PureComponent<void, *, State> {

  state: State = {
    index: 1,
    routes: [
      { key: '0', title: 'SIGN UP', icon: 'account' },
      { key: '1', title: 'SELFIE', icon: 'camera' },
      { key: '2', title: 'COLORS', icon: 'ios-color-palette' }
    ]
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
        return <MaterialCommunityIcons name={route.icon} size={30} style={
            route.key == this.state.index ? [iconActive,favSpacer] : [iconInactive,favSpacer]
          }/>
      case '1':
        return <Entypo name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
      default:
        return <Ionicons name={route.icon} size={30} style={
            route.key == this.state.index ? iconActive : iconInactive
          }/>
    }

  }

  renderBadge = ({ route }) => {
    return <View/>
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
          <Signup
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      case '1':
        return (
          <Selfie
            state={this.state}
            focused={focused}
            tabRoute={route}
          />
        )
      case '2':
        return (
          <LipColors
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
    let { screenWidth:width,screenHeight:height } = this.props.settings
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderFooter={this.renderFooter}
        onIndexChange={this.handleChangeTab}
        initialLayout={{width,height}}
      />
    )
  }

}

TabNavGuest.propTypes = {
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings
})

export default connect(mapStateToProps)(TabNavGuest)
