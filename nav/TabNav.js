

import React, { PureComponent } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import { Constants,Permissions,Notifications } from 'expo'

//LIBS
import { connect } from 'react-redux'
import { Ionicons,Entypo,MaterialCommunityIcons,FontAwesome } from '@expo/vector-icons'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import type { NavigationState } from 'react-native-tab-view/types'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetUserType,GetDistributorStatus,GetAdminChats,GetAllDistributorsStatusForShopper } from '../api/db/queries'
import { SubToUserType,SubToDistributorStatus,SubToDistributorsForShopper } from '../api/db/pubsub'
import { AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr } from '../api/db/mutations'

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
const debugging = false

type Route = {
  key: string,
  title: string,
  icon: string
}

type State = NavigationState<Route>;

class TabNav extends PureComponent<void, *, State> {

  state: State = {
    index: 1,
    routes: [
      { key: '0', title: 'FAVORITES', icon: 'star' },
      { key: '1', title: 'CHAT', icon: 'chat' },
      { key: '2', title: 'SELFIE', icon: 'camera' },
      { key: '3', title: 'LIP COLORS', icon: 'ios-color-palette' },
      { key: '4', title: 'YOU', icon: 'account' }
    ],
    loaded: false,
    userType: this.props.navigation.state.params.user.type,
    distributorStatus: this.props.navigation.state.params.user.distributorx.status,
    notificationsHasShopper: false,
    user2AdminDmExists: false,
    adminChats: [],
    sadvrId: null,
    shoppersDistributor: 'updatedAt',
    unreadCount: this.props.unreadCount
  }

  componentDidMount(){
    this.subToUserType()
    this.subToDistributorStatus()
    this.subToAllDistributorsStatusForShopper()
    // this.registerForPushNotificationsAsync()
  }
  
  subToUserType(){
    this.props.getUserType.subscribeToMore({
      document: SubToUserType,
      variables: {UserId:this.props.navigation.state.params.user.id}
    })
  }

  subToDistributorStatus(){
    this.props.getDistributorStatus.subscribeToMore({
      document: SubToDistributorStatus,
      variables: {DistributorId:this.props.navigation.state.params.user.distributorx.id}
    })
  }

  subToAllDistributorsStatusForShopper(){
    if (
      this.props.navigation.state.params.user 
      && this.props.navigation.state.params.user.shopperx 
      && this.props.navigation.state.params.user.shopperx.id
    ) {
      this.props.getAllDistributorsStatusForShopper.subscribeToMore({
        document: SubToDistributorsForShopper,
        variables: {ShopperId:{"id":this.props.navigation.state.params.user.shopperx.id}},
        updateQuery: (previous,{subscriptionData}) => {
          let { mutation } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            this.setState({shoppersDistributor: `updatedAt-${new Date()}`})
          }
        }
      })
    }
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getUserType
      && newProps.getUserType.User
      && newProps.getUserType.User.type
    ) {
      let exUserType = this.state.userType
      let newUserType = newProps.getUserType.User.type
      if (newUserType !== exUserType) {
        this.updateUserTypeLocally(newUserType)
        if (debugging) console.log('exUserType: ',exUserType);
        if (debugging) console.log('newUserType: ',newUserType);
      }
    }
    if (
      newProps.getDistributorStatus
      && newProps.getDistributorStatus.Distributor
      && newProps.getDistributorStatus.Distributor.status
    ) {
      let localStatus = this.state.distributorStatus
      let distributorStatus = newProps.getDistributorStatus.Distributor.status
      if (distributorStatus !== localStatus) {
        this.setState({distributorStatus})
      }
    }
    if (
      newProps.getAdminChats && 
      newProps.getAdminChats.allChats && 
      newProps.getAdminChats.allChats.length > 0
    ) {
      if (newProps.getAdminChats.allChats !== this.state.adminChats) {
        this.setState({adminChats:newProps.getAdminChats.allChats},()=>{
          let shopperId = this.props.navigation.state.params.user.shopperx.id
          let groupChat = this.state.adminChats.find( chat => {
            return chat.type === 'SADVR2ALL'
          })
          let dmChat = this.state.adminChats.find( chat => {
            return chat.type === 'DMU2ADMIN'
          })
          this.addShopperToAppNotificationGroupChatInDb(groupChat.id,shopperId)
          this.setState({sadvrId:groupChat.distributorsx[0].id},()=>{
            if (!dmChat) {
              if (debugging) console.log('theres no dmChat, therefore calling createDmChatForShopperAndDistributorInDb func');
              this.createDmChatForShopperAndSadvrInDb(shopperId,groupChat.distributorsx[0].id)
            } else {
              this.setState({user2AdminDmExists:true})
              if (debugging) console.log('there is a dmChat obj, therefore no need to call createDmChatForShopperAndDistributorInDb func');
            }
          })
        })
      }
    }
    if (newProps.unreadCount && newProps.unreadCount !== this.props.unreadCount) {
      if (newProps.unreadCount !== this.state.unreadCount) {
        this.setState({unreadCount:newProps.unreadCount},()=>{
          console.log('newProps.unreadCount',this.state.unreadCount)
        })
      }
    }
    // if (newProps.unreadCount) console.log('newProps.unreadCount recd',newProps.unreadCount);
  }

  addShopperToAppNotificationGroupChatInDb(chatId,shopperId){
    if (chatId && shopperId) {
      this.props.addShopperToAppNotificationGroupChat({
        variables: {chatId,shopperId}
      }).then( res => {
        if (res && res.data && res.data.addToChatOnShopper) {
          this.setState({notificationsHasShopper:true})
        } else {
          if (debugging) console.log('no response received from addShopperToAppNotificationGroupChat mutation');
        }
      }).catch( e => {if (debugging) console.log('failed to addShopperToAppNotificationGroupChat in DB',e.message)})
    } else {
      if (debugging) console.log('insufficient inputs to run addShopperToAppNotificationGroupChat mutation');
    }
  }

  createDmChatForShopperAndSadvrInDb(shopperId,distributorId){
    if (debugging) console.log('createDmChatForShopperAndDistributor func called');
    if (shopperId && distributorId) {
      this.props.createDmChatForShopperAndSadvr({
        variables: { shopperId,distributorId }
      }).then( res => {
        if (res && res.data && res.data.createChat) {
          this.setState({user2AdminDmExists:true})
          if (debugging) console.log('successfully received res from createDmChatForShopperAndDistributor mutation');
        } else {
          if (debugging) console.log('failed to receive res from createDmChatForShopperAndDistributor mutation');
        }
      }).catch( e => {
        if (debugging) console.log('failed to process createDmChatForShopperAndDistributor mutation',e.message);
      })
    } else {
      if (debugging) console.log('insufficient inputs to run createDmChatForShopperAndDistributor mutation');
    }
  }

  updateUserTypeLocally(userType){
    this.setState({userType})
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
    if (route.key === '1' && this.state.unreadCount > 0) {
      return (
        <View style={styles.badge}>
          <Text style={styles.count}>{this.state.unreadCount}</Text>
        </View>
      )
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
    let { deviceYearClass:year } = Constants
    if (year >= 2016) {
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
    } else {
      return null
    }
  }

  // renderSceneMap = SceneMap({
  //   '0': Likes,
  //   '1': Chat,
  //   '2': Selfie,
  //   '3': LipColors,
  //   '4': You
  // })

  renderScene = ({ route,focused }) => {
    let { user,localStorage } = this.props.navigation.state.params
    let { navigation } = this.props
    let { userType,distributorStatus,sadvrId,shoppersDistributor } = this.state
    switch (route.key) {
      case '0':
        return (
          <Likes
            state={this.state}
            focused={focused}
            tabRoute={route}
            user={user}
            userType={userType}
            distributorStatus={distributorStatus}
            shoppersDistributor={shoppersDistributor}
            nav={navigation}
            localStorage={localStorage} 
            sadvrId={sadvrId}
          />
        )
      case '1':
        if (this.state.notificationsHasShopper && this.state.user2AdminDmExists) {
          return (
            <Chat
              state={this.state}
              focused={focused}
              tabRoute={route}
              user={user}
              userType={userType}
              distributorStatus={distributorStatus}
              shoppersDistributor={shoppersDistributor}
              nav={navigation}
              localStorage={localStorage}
            />
          )
        } else {
          return (
            <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
              <DotsLoader
                size={15}
                color={Colors.pinkly}
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
            user={user}
            userType={userType}
            distributorStatus={distributorStatus}
            shoppersDistributor={shoppersDistributor}
            nav={navigation}
            localStorage={localStorage}
          />
        )
      case '3':
        return (
          <LipColors
            state={this.state}
            focused={focused}
            tabRoute={route}
            user={user}
            userType={userType}
            distributorStatus={distributorStatus}
            shoppersDistributor={shoppersDistributor}
            nav={navigation}
            localStorage={localStorage}
          />
        )
      case '4':
        return (
          <You
            state={this.state}
            focused={focused}
            tabRoute={route}
            user={user}
            userType={userType}
            distributorStatus={distributorStatus}
            shoppersDistributor={shoppersDistributor}
            nav={navigation}
            localStorage={localStorage}
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
        style={[styles.container, this.props.style]}
        navigationState={this.state}
        renderScene={this.renderScene}
        renderFooter={this.renderFooter}
        onIndexChange={this.handleChangeTab}
      />
    )
  }
  
  registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('finalStatus:',finalStatus)
      return
    }

    let token = await Notifications.getExpoPushTokenAsync()

    console.log('this token recd',token)
  }

}

const TabNavWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.navigation.state.params.user.id || ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetDistributorStatus,{
    name: 'getDistributorStatus',
    options: props => ({
      variables: {
        DistributorId: props.navigation.state.params.user.distributorx.id || ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetAdminChats,{
    name: 'getAdminChats',
    options: props => ({
      variables: {
        shopperId: {"id": props.navigation.state.params.user.shopperx.id || ""}
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
        ShopperId: {
          id: props.navigation.state.params.user.shopperx.id
        }
      },
      fetchPolicy: 'network-only'
    })
  })
)(TabNav)

const mapStateToProps = state => ({ unreadCount:state.unreadCount })

export default connect(mapStateToProps)(TabNavWithData)

// updateQuery: (previous, { subscriptionData }) => {}
