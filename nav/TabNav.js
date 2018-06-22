

import React, { PureComponent } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import { Constants,Permissions,Notifications } from 'expo'

//LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { debounce } from 'underscore'
import { Ionicons,Entypo,MaterialCommunityIcons,FontAwesome } from '@expo/vector-icons'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import type { NavigationState } from 'react-native-tab-view/types'
import { DotsLoader } from 'react-native-indicator'

// GQL
import {
  GetUserType,GetDistributorStatus,GetAdminChats,GetAllDistributorsStatusForShopper
} from '../api/db/queries'
import {
  SubToUserType,SubToDistributorStatus,SubToDistributorsForShopper
} from '../api/db/pubsub'
import {
  AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr,UpdatePushToken
} from '../api/db/mutations'

// STORE
import {
  setSadvrId,updateUser,updateDistributor,updateShoppersDistributor
} from '../store/actions'

//SCREENS
import Likes from '../screens/Likes/Preloader'
import Chat from '../screens/Chat/Preloader'
import Selfie from '../screens/Selfie/Preloader'
import LipColors from '../screens/LipColors/Preloader'
import You from '../screens/You/Preloader'

//LOCALS
import { Views,Colors } from '../css/Styles'
import { FontPoiret } from '../screens/common/fonts'
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
        title: this.props.user.type === 'SHOPPER' ? 'COLORS' : 'INVENTORY',
        icon: 'ios-color-palette' },
      { key: '4', title: 'YOU', icon: 'account' }
    ],
    loaded: false,
    userType: this.props.user.type,
    notificationsHasShopper: false,
    user2AdminDmExists: false,
    adminChats: [],
    sadvrId: null,
    unreadCount: this.props.unreadCount,
    // isMounted: false
  }

  componentDidMount(){
    this.subToUserType()
    this.subToDistributorStatus()
    this.subToAllDistributorsStatusForShopper()
    this.registerForPushNotificationsAsync()
  }

  constructor(props){
    super(props)
    this.modifyShoppersDistributor = debounce(this.modifyShoppersDistributor,3000,true)
  }

  componentWillUnmount() {
    this.notificationSubscription && this.notificationSubscription.remove()
  }

  // tranfer to centralized
  subToUserType(){
    this.props.getUserType.subscribeToMore({
      document: SubToUserType,
      variables: {
        UserId: this.props.user.id
      },
      updateQuery: (previous,{ subscriptionData }) => {
        let { mutation,node:{ type:nextType },previousValues:{ type:prevType } } = subscriptionData.data.User
        if (mutation === 'UPDATED') {
          if (nextType !== prevType) this.props.updateUser({type:nextType})
        }
      }
    })
  }

  // transfer subscription to new chat preloader
  // add subscription to LipColors.js
  subToDistributorStatus(){
    this.props.getDistributorStatus.subscribeToMore({
      document: SubToDistributorStatus,
      variables: {
        DistributorId: this.props.distributor.id
      },
      updateQuery: (previous,{ subscriptionData }) => {
        let {
          mutation,
          node:{ status:nextStatus },
          previousValues:{ status:prevStatus }
        } = subscriptionData.data.Distributor
        if (mutation === 'UPDATED') {
          if (nextStatus !== prevStatus) this.props.updateDistributor({status:nextStatus})
        }
      }
    })
  }

  // add subscription to Likes.js
  // transfer subscription to new chat preloader
  subToAllDistributorsStatusForShopper(){
    if (this.props.shopper.id) {
      this.props.getAllDistributorsStatusForShopper.subscribeToMore({
        document: SubToDistributorsForShopper,
        variables: {
          ShopperId: { "id": this.props.shopper.id }
        },
        updateQuery: (previous,{subscriptionData}) => {
          let { mutation } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            this.modifyShoppersDistributor(subscriptionData.data.Distributor.node)
          }
        }
      })
    }
  }

  modifyShoppersDistributor(dist) {
    this.props.updateShoppersDistributor(dist)
  }

  // transfer to centralized
  componentWillReceiveProps(newProps){
    if (
      newProps.getAdminChats &&
      newProps.getAdminChats.allChats &&
      newProps.getAdminChats.allChats.length > 0
    ) {
      if (newProps.getAdminChats.allChats !== this.state.adminChats) {
        this.setState({adminChats:newProps.getAdminChats.allChats},()=>{
          let shopperId = this.props.shopper.id
          let groupChat = this.state.adminChats.find( chat => {
            return chat.type === 'SADVR2ALL'
          })
          let dmChat = this.state.adminChats.find( chat => {
            return chat.type === 'DMU2ADMIN'
          })
          this.addShopperToAppNotificationGroupChatInDb(groupChat.id,shopperId)
          let sadvrId = groupChat.distributorsx[0].id
          this.props.setSadvrId(sadvrId)
          if (!dmChat) {
            debugging && console.log('no dmChat for Shopper and their distributor... therefore creating');
            this.createDmChatForShopperAndSadvrInDb(shopperId,groupChat.distributorsx[0].id)
          } else {
            this.setState({user2AdminDmExists:true})
            debugging && console.log('dmChat for Shopper and their distributor exists');
          }
        })
      }
    }
  }

  addShopperToAppNotificationGroupChatInDb(chatId,shopperId){
    if (chatId && shopperId) {
      this.props.addShopperToAppNotificationGroupChat({
        variables: {chatId,shopperId}
      }).then( res => {
        if (res && res.data && res.data.addToChatOnShopper) {
          this.setState({notificationsHasShopper:true})
        } else {
          debugging && console.log('no response received from addShopperToAppNotificationGroupChat mutation');
        }
      }).catch( e => {debugging && console.log('addShopperToAppNotificationGroupChat in DB failed',e.message)})
    } else {
      debugging && console.log('insufficient inputs to run addShopperToAppNotificationGroupChat mutation');
    }
  }

  createDmChatForShopperAndSadvrInDb(shopperId,distributorId){
    debugging && console.log('createDmChatForShopperAndDistributor func called');
    if (shopperId && distributorId) {
      this.props.createDmChatForShopperAndSadvr({
        variables: { shopperId,distributorId }
      }).then( res => {
        if (res && res.data && res.data.createChat) {
          this.setState({user2AdminDmExists:true})
          debugging && console.log('received res from createDmChatForShopperAndDistributor mutation');
        } else {
          debugging && console.log('failed to receive res from createDmChatForShopperAndDistributor mutation');
        }
      }).catch( e => {
        debugging && console.log('failed to process createDmChatForShopperAndDistributor mutation',e.message);
      })
    } else {
      debugging && console.log('insufficient inputs to run createDmChatForShopperAndDistributor mutation');
    }
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
        style={styles.container}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderFooter={this.renderFooter}
        onIndexChange={this.handleChangeTab}
      />
    )
  }

  async registerForPushNotificationsAsync(){
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    if (status === 'granted') {
      this.getPushToken()
    } else {
      // Linking.openURL('app-settings://notification/lipchat')
      let { status:newStatus } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      newStatus === 'granted' ? this.getPushToken() : this.updatePushTokenInDb(null)
    }
  }

  async getPushToken(){
    let token = await Notifications.getExpoPushTokenAsync()
    token && this.updatePushTokenInDb(token)
  }

  updatePushTokenInDb(token){
    this.props.updatePushToken({
      variables: {
        userId: this.props.user.id,
        token
      }
    }).then(()=>{
      token && this.createNotificationSubscription()
    }).catch(err => debugging && console.log(err))
  }

  createNotificationSubscription(){
    this.notificationSubscription = Notifications.addListener(
      this.handleNotification
    )
  }

  handleNotification = (notification) => {
    debugging && console.log('notification received',notification)
  }

}

TabNav.propTypes = {
  user: PropTypes.object.isRequired,
  shopper: PropTypes.object.isRequired,
  distributor: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  user: state.user,
  shopper: state.shopper,
  distributor: state.distributor,
  unreadCount: state.unreadCount,
  chats: state.chats
})

const TabNavWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.user.id
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetDistributorStatus,{
    name: 'getDistributorStatus',
    options: props => ({
      variables: {
        DistributorId: props.distributor.id
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetAdminChats,{
    name: 'getAdminChats',
    options: props => ({
      variables: {
        shopperId: { "id": props.shopper.id }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(AddShopperToAppNotificationGroupChat,{
    name: 'addShopperToAppNotificationGroupChat'
  }),
  graphql(CreateDmChatForShopperAndSadvr,{
    name: 'createDmChatForShopperAndSadvr'
  }),
  graphql(GetAllDistributorsStatusForShopper,{
    name: 'getAllDistributorsStatusForShopper',
    options: props => ({
      variables: {
        ShopperId: { id: props.shopper.id }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(UpdatePushToken,{
    name: 'updatePushToken'
  })
)(TabNav)

export default connect(mapStateToProps,{
  setSadvrId,updateUser,updateDistributor,updateShoppersDistributor
})(TabNavWithData)
