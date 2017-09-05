

import React, { Component } from 'react'
import { View,AsyncStorage } from 'react-native'

// LIBS
import {  compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// LOCALS
import { Views,Colors } from '../css/Styles'
import { err,clearIdentifiers,getGQLerror } from '../utils/Helpers'
import { AppName } from '../config/Defaults'

//GQL
import { GetUser } from '../api/db/queries'
import { UpdateFbkFriends } from '../api/db/mutations'

const debugging = false

class AuthState extends Component {

  state = {
    localStorage: this.props.screenProps.localStorage,
    user: null,
    userUpdatedCount: 0,
    newPropsErrorCount: 0,
    newPropsElseCount: 0
  }

  // componentWillMount(){
  //   AsyncStorage.setItem('rootKey',this.props.navigation.state.key)
  //     .catch( (e) => {
  //       if (debugging) {console.log(e)}
  //     })
  // }

  componentWillReceiveProps(newProps){
    if (!newProps.getUser.loading) {
      if (newProps.getUser.User) {
        if (newProps.getUser.User !== this.state.user) {
          this.setState({
            user: newProps.getUser.User,
            userUpdatedCount: this.state.userUpdatedCount + 1
          },()=>{
            if (this.state.userUpdatedCount < 2) {
              this.compareFbkFriends()
            } else {
              this.determineAuthStatus()
            }
          })
        }
      } else if (newProps.getUser.error) {
        if (debugging) {console.log('loggedout8')}
        this.setState({newPropsErrorCount: this.state.newPropsErrorCount + 1},()=>{
          if (this.state.newPropsErrorCount < 2) {
            this.determineAuthStatus()
          }
        })
      } else {
        if (debugging) {console.log('loggedout9')}
        this.setState({newPropsElseCount: this.state.newPropsElseCount + 1},()=>{
          if (this.state.newPropsElseCount < 2) {
            this.determineAuthStatus()
          }
        })
      }
    }
  }

  async compareFbkFriends(){
    if (this.state.localStorage.fbkToken) {
      const response = await fetch(`https://graph.facebook.com/v2.9/me?fields=id,friends&access_token=${this.state.localStorage.fbkToken}`)
      let fetchedFacebookFriends = await response.json()
      let fetchedFbkFriends = fetchedFacebookFriends.friends.data || []
      let { id,fbkUserId } = this.state.user
      let localFbkFriends = this.state.user.fbkFriends
      if (fetchedFacebookFriends.id === fbkUserId) {
        if (this.compareArrays(fetchedFbkFriends,localFbkFriends)) {
          this.syncFbkFriends(id,fetchedFbkFriends)
        } else {
          this.determineAuthStatus()
        }
      } else {
        this.determineAuthStatus()
      }
    } else {
      if (debugging) {console.log('loggedout10')}
      await clearIdentifiers()
      this.goTo('LoggedOut')
    }
  }

  syncFbkFriends(id,fbkFriends){
    this.props.updateFbkFriends({
      variables: {
        userId: id,
        fbkFriends: fbkFriends
      }
    }).then( res => {
      //
    }).catch( e => {
      err('Loading',`it looks like your Facebook info has changed, but an attempt to sync your new data, failed.`)
      this.determineAuthStatus()
    })
  }

  compareArrays(arr1,arr2){
    let count = 0
    arr1.forEach( arr1element => {
      if (
        arr2.find( arr2element => {
          return arr2element.id === arr1element.id
        })
      ) {
        return
      } else {
        return count++
      }
    })
    arr2.forEach( arr2element => {
      if (
        arr1.find( arr1element => {
          return arr1element.id === arr2element.id
        })
      ) {
        return
      } else {
        return count++
      }
    })
    return count > 0 ? true : false
  }

  async determineAuthStatus(){
    if (this.state.localStorage && this.state.user) {
      try {
        let { fbkToken,gcToken } = this.state.localStorage
        if (fbkToken !== null && gcToken !== null) {
          let tokenStatus = await this.isExpired(fbkToken)
          if (tokenStatus) {
            if (tokenStatus.expires_in) {
              if (tokenStatus.expires_in > 259200) {
                if (debugging) {console.log('LoggedIn Redirect')}
                this.goTo('LoggedIn')
              } else {
                await clearIdentifiers()
                if (debugging) {console.log('loggedout1')}
                this.goTo('LoggedOut')
              }
            } else if (tokenStatus.error) {
              if (debugging) {console.log('loggedout2')}
              this.goTo('LoggedOut')
            } else {
              if (debugging) {console.log('loggedout3')}
              this.goTo('LoggedOut')
            }
          } else {
            await clearIdentifiers()
            if (debugging) {console.log('loggedout4')}
            this.goTo('LoggedOut')
          }
        } else {
          if (debugging) {console.log('loggedout5')}
          this.goTo('LoggedOut')
        }
      } catch (e) {
        if (debugging) {console.log('loggedout6')}
        this.goTo('LoggedOut')
      }
    } else {
      if (debugging) {console.log('loggedout7')}
      await clearIdentifiers()
      this.goTo('LoggedOut')
    }
  }

  async isExpired(fbkToken){
    const response = await fetch(`https://graph.facebook.com/oauth/access_token_info?access_token=${fbkToken}`)
    let res = await response.json()
    return res
  }

  goTo(screen){
    let passProps = {
      user: this.state.user || {},
      localStorage: this.props.screenProps.localStorage
    }
    setTimeout(()=>{
      this.props.navigation.navigate(screen,passProps)
    },2000)
  }

  render() {
    return (
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <DotsLoader
          size={15}
          color={Colors.blue}
          frequency={5000}/>
      </View>
    )
  }

}

export default compose(
  graphql(GetUser,{
    name: 'getUser',
    options: (props) => ({
      variables: {
        userId: props.screenProps && props.screenProps.localStorage && props.screenProps.localStorage.userId ? props.screenProps.localStorage.userId : null
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(UpdateFbkFriends,{
    name: 'updateFbkFriends'
  })
)(AuthState)
