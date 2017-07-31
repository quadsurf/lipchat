

import React, { Component } from 'react'
import { View } from 'react-native'

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

class AuthState extends Component {

  state = {
    localStorage: this.props.screenProps.localStorage,
    user: null,
    userUpdatedCount: 0
  }

  componentWillReceiveProps(newProps){
    if (!newProps.getUser.loading) {
      if (newProps.getUser.User && newProps.getUser.User !== this.state.user) {
        this.setState({
          user: {
            user: newProps.getUser.User
          },
          userUpdatedCount: this.state.userUpdatedCount + 1
        },()=>{
          // console.log(this.state.user)
          if (this.state.userUpdatedCount < 2) {
            this.compareFbkFriends()
          } else {
            this.determineAuthStatus()
          }
        })
      } else if (newProps.getUser.error) {
        console.log('loggedout8');
        this.goTo('LoggedOut')
      } else {
        // err('Loading',`You may need to log in to ${AppName} again.`)
        console.log('loggedout9');
        this.goTo('LoggedOut')
      }
    }
  }

  async compareFbkFriends(){
    const response = await fetch(`https://graph.facebook.com/v2.9/me?fields=id,friends&access_token=${this.state.localStorage.fbkToken}`)
    let fetchedFbkFriends = await response.json()
    let { id,fbkUserId } = this.state.user.user
    let localFbkFriends = this.state.user.user.fbkFriends
    let count = 0
    await fetchedFbkFriends.friends.data.forEach( fetchedFbkFriend => {
      if (
        localFbkFriends.find( localFbkFriend => {
          return localFbkFriend.id === fetchedFbkFriend.id
        })
      ) {
        return
      } else {
        return count++
      }
    })
    await localFbkFriends.forEach( localFbkFriend => {
      if (
        fetchedFbkFriends.friends.data.find( fetchedFbkFriend => {
          return fetchedFbkFriend.id === localFbkFriend.id
        })
      ) {
        return
      } else {
        return count++
      }
    })
    if (fetchedFbkFriends.id === fbkUserId) {
      if (count > 0) {
        this.syncFbkFriends(id,fetchedFbkFriends.friends.data)
      } else {
        this.determineAuthStatus()
      }
    } else {
      console.log('loggedout10');
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
      console.log('res from updateFbkFriends func');
      console.log(res);
    }).catch( e => {
      err('Loading',`it looks like your Facebook info has changed, but an attempt to sync your new data, failed.`,`Reason: ${getGQLerror(e)}`)
      this.determineAuthStatus()
    })
  }

  async determineAuthStatus(){
    try {
      let { fbkToken,gcToken } = this.state.localStorage
      if (fbkToken !== null) {
        let tokenStatus = await this.isExpired(fbkToken)
        if (tokenStatus) {
          if (tokenStatus.expires_in) {
            if (tokenStatus.expires_in > 259200 && gcToken !== null && this.state.user) {
              console.log('LoggedIn Redirect');
              this.goTo('LoggedIn')
            } else {
              clearIdentifiers()
              console.log('loggedout1');
              this.goTo('LoggedOut')
            }
          } else if (tokenStatus.error) {
            console.log('loggedout2');
            this.goTo('LoggedOut')
          } else {
            console.log('loggedout3');
            this.goTo('LoggedOut')
          }
        } else {
          clearIdentifiers()
          console.log('loggedout4');
          this.goTo('LoggedOut')
        }
      } else {
        console.log('loggedout5');
        this.goTo('LoggedOut')
      }
    } catch (e) {
      // err('Loading',`${AppName} is having a hard time either loading your content, or determining whether you're logged in or not. Please force quit ${AppName} and re-open, or try logging in again.`,e.message)
      console.log('loggedout6');
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
      rootKey: this.props.navigation.state.key
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
        userId: props.screenProps.localStorage.userId || null
      }
    })
  }),
  graphql(UpdateFbkFriends,{
    name: 'updateFbkFriends'
  })
)(AuthState)
