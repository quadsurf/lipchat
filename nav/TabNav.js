

// import { ImagePicker } from 'expo'
import React, { PureComponent } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

//LIBS
import { Ionicons,Entypo,MaterialCommunityIcons } from '@expo/vector-icons'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import type { NavigationState } from 'react-native-tab-view/types'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetUserType,GetDistributorStatus,GetAdminChats } from '../api/db/queries'
import { SubToUserType,SubToDistributorStatus } from '../api/db/pubsub'
import { AddShopperToAppNotificationGroupChat,CreateDmChatForShopperAndSadvr } from '../api/db/mutations'

//SCREENS
import Likes from '../screens/Likes/Likes'
import Chat from '../screens/Chat/Chat'
import Selfie from '../screens/Selfie'
import LipColors from '../screens/LipColors'
import You from '../screens/You/You'

//LOCALS
import { Views,Colors } from '../css/Styles'

//CONSTs
const debugging = false

type Route = {
  key: string,
  title: string,
  icon: string
}

type State = NavigationState<Route>;
// ios-heart
class TabNav extends PureComponent<void, *, State> {

  state: State = {
      index: 2,
      routes: [
        { key: '0', title: 'ADD', icon: 'md-basket' },
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
      sadvrId: null
    }

  componentWillMount(){
    this.subToUserType()
    this.subToDistributorStatus()
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
  }

//NEEDS ERROR HANDLING
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

//NEEDS ERROR HANDLING  
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
    switch(route.key){
      case '1':
        return <Entypo name={route.icon} size={30} style={
            route.key == this.state.index ? styles.iconActive : styles.iconInactive
          }/>
      case '2':
        return <Entypo name={route.icon} size={30} style={
            route.key == this.state.index ? styles.iconActive : styles.iconInactive
          }/>
      case '4':
        return <MaterialCommunityIcons name={route.icon} size={30} style={
            route.key == this.state.index ? styles.iconActive : styles.iconInactive
          }/>
      default:
        return <Ionicons name={route.icon} size={30} style={
            route.key == this.state.index ? styles.iconActive : styles.iconInactive
          }/>
    }

  }

  renderBadge = ({ route }) => {
    if (route.key === '1') {
      return (
        null
        // <View style={styles.badge}>
        //   <Text style={styles.count}>42</Text>
        // </View>
      )
    }
    return null
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
    let { userType,distributorStatus,sadvrId } = this.state
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
              nav={navigation}
              localStorage={localStorage}
            />
          )
        } else {
          return <DotsLoader
            size={15}
            color={Colors.pinkly}
            frequency={5000}/>
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

}

export default compose(
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
      }
    })
  }),
  graphql(AddShopperToAppNotificationGroupChat,{
    name: 'addShopperToAppNotificationGroupChat'
  }),
  graphql(CreateDmChatForShopperAndSadvr,{
    name: 'createDmChatForShopperAndSadvr'
  })
)(TabNav)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabbar: {
    backgroundColor: Colors.purpleText
  },
  tab: {
    padding: 0,
    margin: 0,
    paddingTop: 6,
    paddingBottom: 8
  },
  labelActive: {
    backgroundColor: 'transparent',
    fontSize: 10,
    color: Colors.blue,
    marginTop: 0
  },
  labelInactive: {
    backgroundColor: 'transparent',
    fontSize: 10,
    color: Colors.offWhite,
    marginTop: 0
  },
  iconActive: {
    backgroundColor: 'transparent',
    color: Colors.blue,
    margin: 0,
    padding: 0
  },
  iconInactive: {
    backgroundColor: 'transparent',
    color: Colors.purpleDarker,
    margin: 0,
    padding: 0
  },
  indicator: {
    flex: 1,
    backgroundColor: Colors.purple,
    margin: 4,
    borderRadius: 4,
  },
  badge: {
    marginTop: 1,
    marginRight: 6,
    backgroundColor: Colors.transparentPurplest,
    height: 24,
    width: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  }
})

// updateQuery: (previous, { subscriptionData }) => {}
