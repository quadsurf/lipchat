

import React, { Component } from 'react'
import { View,AsyncStorage,Dimensions } from 'react-native'
import { Asset, Font } from 'expo'

// console.ignoredYellowBox = ['Warning: checkPropTypes']
console.disableYellowBox = __DEV__ && true

//LIBS
import { ApolloProvider } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// COMPONENTS
import RootNav from './nav/RootNav'
import TabNav from './nav/TabNav'

// LOCALS
import getClient from './api/ApolloClientRT'
import getStore from './store/config'
import { Colors,Views } from './css/Styles'
import { AppName } from './config/Defaults'
import { err } from './utils/Helpers'
import MyStatusBar from './common/MyStatusBar'
import { setTokens,setAuthUser,setSettings,setRootKey,setNetworkClient,setAppReset } from './store/actions'

// CONSTs
const debugging = __DEV__ && false
const store = getStore()
const screen = Dimensions.get("window")
store.dispatch(setSettings(screen))

export default class App extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      assetsAreLoaded: false,
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      localStorage: false
    }
    
    this.imagesToPreload = [
      require('./assets/icons/iconWithBorder.png'),
      require('./assets/images/splashTransparent.png'),
      require('./assets/images/water-proof.jpg'),
      require('./assets/images/kiss-proof.jpg'),
      require('./assets/images/smudge-proof.jpg'),
      require('./assets/images/cruelty-free.jpg'),
      require('./assets/images/avatar.png')
    ]
    
    this.fontsToPreLoad = {
      Matilde: require('./assets/fonts/Matilde.ttf'),
      Poiret: require('./assets/fonts/Poiret.ttf'),
      // LatoBold: require('./assets/fonts/LatoBold.ttf')
    }
  }

  appReset(){
    this.setState({localStorage:false},()=>{
      this.getAllAsyncStorage()
      // AsyncStorage.clear()
    })
  }

  componentWillMount(){
    this.loadAssetsAsync()
    this.appReset()
    store.dispatch(setAppReset(this.appReset.bind(this)))
  }
  
  // componentDidMount(){
  //   console.log('store',store.getState());
  // }

  getAllAsyncStorage(){
    let localStorage = {}
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
       stores.map((result, i, store) => {
         let key = store[i][0]
         let value = JSON.parse(store[i][1])
         localStorage[`${key}`] = value
        })
      }).then(()=>{
        this.setState({
          ...localStorage,
          localStorage: true
        })
      })
    })
  }

  render() {
    if (!this.state.assetsAreLoaded && !this.props.skipLoadingScreen) {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <MyStatusBar/>
          <DotsLoader
            size={15}
            color={Colors.blue}
            frequency={5000}/>
        </View>
      )
    } else {
      if (this.state.localStorage) {
        let gcToken,fbkToken
        if (this.state.tokens) {
          gcToken = this.state.tokens.gc ? this.state.tokens.gc : ''
          fbkToken = this.state.tokens.fbk ? this.state.tokens.fbk : ''
          store.dispatch(setTokens({gcToken,fbkToken}))
        }
        if (this.state.user && this.state.user.hasOwnProperty('id')) {
          store.dispatch(setAuthUser(this.state.user.id))
        }
        let client = getClient(gcToken,store)
        store.dispatch(setNetworkClient(client))
        return (
          <ApolloProvider client={client} store={store}>
            <View style={{flex:1,backgroundColor:Colors.bgColor}}>
              <MyStatusBar/>
              <RootNav/>
            </View>
          </ApolloProvider>
        )
      } else {
        return (
          <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
            <MyStatusBar/>
            <DotsLoader
              size={15}
              color={Colors.blue}
              frequency={5000}/>
          </View>
        )
      }
    }
  }

  async loadAssetsAsync() {
    try {
      await Promise.all([
        Asset.loadAsync(this.imagesToPreload),
        Font.loadAsync(this.fontsToPreLoad),
      ])
    } catch (e) {
      if (debugging) console.log(e.message)
    } finally {
      setTimeout(()=>{
        this.setState({ assetsAreLoaded: true })
      },0)
    }
  }
}
