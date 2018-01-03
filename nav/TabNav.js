

// import { ImagePicker } from 'expo'
import React, { PureComponent } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'

//LIBS
import { Ionicons,Entypo,MaterialCommunityIcons } from '@expo/vector-icons'
import { TabViewAnimated,TabBar } from 'react-native-tab-view'
import type { NavigationState } from 'react-native-tab-view/types'
import { compose,graphql } from 'react-apollo'

// GQL
import { GetUserType,GetDistributorStatus } from '../api/db/queries'
import { SubToUserType,SubToDistributorStatus } from '../api/db/pubsub'

//SCREENS
import Likes from '../screens/Likes'
import Chat from '../screens/Chat/Chat'
import Selfie from '../screens/Selfie'
import LipColors from '../screens/LipColors'
import You from '../screens/You'

//LOCALS
import { Views,Colors } from '../css/Styles'

// class Cam extends Component {
//   renderCam(){
//     ImagePicker.launchCameraAsync()
//   }
//   render(){
//     return (
//       <View style={{...Views.middle}}>
//         {this.renderCam()}
//       </View>
//     )
//   }
// }

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
        { key: '0', title: 'LIKES', icon: 'ios-heart' },
        { key: '1', title: 'CHAT', icon: 'chat' },
        { key: '2', title: 'SELFIE', icon: 'camera' },
        { key: '3', title: 'LIP COLORS', icon: 'ios-color-palette' },
        { key: '4', title: 'YOU', icon: 'account' }
      ],
      loaded: false,
      userType: this.props.navigation.state.params.user.type,
      distributorStatus: this.props.navigation.state.params.user.distributorx.status
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
    if (newProps) {
      if (
        newProps.getUserType
        && newProps.getUserType.User
        && newProps.getUserType.User.type
      ) {
        let exUserType = this.state.userType
        let newUserType = newProps.getUserType.User.type
        if (newUserType !== exUserType) {
          this.updateUserTypeLocally(newUserType)
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
    }
  }

  updateUserTypeLocally(userType){
    this.setState({userType},()=>{
      if (this.state.userType === 'DIST') {
        this.createGroupChatForDistributorInDb()
      }
    })
  }

  createGroupChatForDistributorInDb(){
    
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
        <View style={styles.badge}>
          <Text style={styles.count}>42</Text>
        </View>
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
    let { userType,distributorStatus } = this.state
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
          />
        )
      case '1':
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
            <Text style={{color:Colors.blue}}>Tabs Failed to Load</Text>
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
        onRequestChangeTab={this.handleChangeTab}
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
