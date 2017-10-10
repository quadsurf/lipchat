

import React from 'react'
import { View,AsyncStorage } from 'react-native'
import { Asset, Font } from 'expo'

console.ignoredYellowBox = ['Warning: checkPropTypes']

//LIBS
import { ApolloProvider } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// COMPONENTS
import RootNav from './nav/RootNav'
import TabNav from './nav/TabNav'

// LOCALS
// import client from './api/ApolloClientRT'
import getClient from './api/ApolloClientRT'
import { Colors,Views } from './css/Styles'
import { AppName } from './config/Defaults'
import { err } from './utils/Helpers'
import MyStatusBar from './common/MyStatusBar'

export default class App extends React.Component {
  state = {
    assetsAreLoaded: false,
    imagesToPreload: [
      require('./assets/icons/icon.png'),
      require('./assets/images/splash.jpg'),
      require('./assets/images/water-proof.jpg'),
      require('./assets/images/kiss-proof.jpg'),
      require('./assets/images/smudge-proof.jpg'),
      require('./assets/images/cruelty-free.jpg'),
      require('./assets/images/avatar.png')
    ],
    fontsToPreLoad: [
      { 'Matilde': require('./assets/fonts/Matilde.ttf') },
      { 'Poiret': require('./assets/fonts/Poiret.ttf') }
    ],
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    localStorage: null
  }

  componentWillMount() {
    this.loadAssetsAsync()
    this.getAllAsyncStorage()
  }

  getAllAsyncStorage(){
    let localStorage = {}
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
       stores.map((result, i, store) => {
         let key = store[i][0]
         let value = store[i][1]
         localStorage[`${key}`] = value
        })
      }).then(()=>{
        this.setState({localStorage:{localStorage}})
      })
    })
  }

  render() {
    if (!this.state.assetsAreLoaded && !this.props.skipLoadingScreen) {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <MyStatusBar hidden={true} />
          <DotsLoader
            size={15}
            color={Colors.pink}
            frequency={5000}/>
        </View>
      )
    } else {
      if (this.state.localStorage !== null) {
        return (
          <ApolloProvider client={getClient(this.state.localStorage.localStorage.gcToken)}>
            <View style={{flex:1}}>
              <MyStatusBar hidden={true} />
              <RootNav localStorage={this.state.localStorage}/>
            </View>
          </ApolloProvider>
        )
      } else {
        return (
          <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
            <MyStatusBar hidden={true} />
            <DotsLoader
              size={15}
              color={Colors.pink}
              frequency={5000}/>
          </View>
        )
      }
    }
  }

  async loadAssetsAsync() {
    try {
      await Promise.all([
        Asset.loadAsync(this.state.imagesToPreload),
        Font.loadAsync(this.state.fontsToPreLoad),
      ])
    } catch (e) {
      // In this case, you might want to report the error to your error
      // reporting service, for example Sentry
      console.warn(
        'There was an error caching assets (see: App.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      )
      console.log(e)
    } finally {
      setTimeout(()=>{
        this.setState({ assetsAreLoaded: true })
      },0)
    }
  }
}
