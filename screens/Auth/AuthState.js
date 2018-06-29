

import React, { Component } from 'react'
import { View,AsyncStorage } from 'react-native'

// LIBS
import {  compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'

// STORE
import { updateUser,setShopper,setShoppersDistributors,setDistributor } from '../../store/actions'

// LOCALS
import { Views,Colors } from '../../css/Styles'
import { AppName } from '../../config/Defaults'

//GQL
import { GetUser } from '../../api/db/queries'

//CONSTs
const debugging = __DEV__ && false
const debounceDuration = 750

class AuthState extends Component {

  constructor(props){
    super(props)
    this.state = { isMounted:false }
    this.goTo = debounce(this.goTo,debounceDuration,true)
    this.partitionUser = debounce(this.partitionUser,debounceDuration,true)
  }

  componentWillReceiveProps(newProps){
    if (!newProps.getUser.loading) {
      if (
        newProps.getUser.User
        && newProps.getUser.User.hasOwnProperty('id')
      ) {
        this.partitionUser(newProps.getUser.User)
      } else if (newProps.getUser.error) {
        debugging && console.log('loggedout7',newProps.getUser.error)
        this.goTo('LoggedOut')
      } else {
        debugging && console.log('loggedout8')
        this.goTo('LoggedOut')
      }
    }
  }

  partitionUser(user){
    let newUser = { ...user }

    let shoppersDistributors = newUser.shopperx.distributorsx
    if (!this.state.isMounted) {
      this.setState({isMounted:true},()=>{
        this.props.setShoppersDistributors(shoppersDistributors)
      })
    }

    let shopper = {
      __typename: 'Shopper',
      id: newUser.shopperx.id
    }
    this.props.setShopper(shopper)
    delete newUser.shopperx

    this.props.setDistributor(newUser.distributorx)
    delete newUser.distributorx

    this.props.updateUser(newUser)
    this.determineAuthStatus()
  }

  async determineAuthStatus(){
    try {
      let { fbkToken,gcToken } = this.props
      if (fbkToken && gcToken) {
        let tokenStatus = await this.isExpired(fbkToken)
        if (tokenStatus.hasOwnProperty('expires_in')) {
          if (tokenStatus.expires_in) {
            // > 259200
            if (tokenStatus.expires_in > 259200) {
              this.goTo('LoggedIn')
              debugging && console.log('LoggedIn Redirect')
            } else {
              this.goTo('LoggedOut')
              debugging && console.log('loggedout1')
            }
          } else if (tokenStatus.error) {
            this.goTo('LoggedOut')
            debugging && console.log('loggedout2')
          } else {
            this.goTo('LoggedOut')
            debugging && console.log('loggedout3')
          }
        } else {
          this.goTo('LoggedOut')
          debugging && console.log('loggedout4')
        }
      } else {
        this.goTo('LoggedOut')
        debugging && console.log('loggedout5')
      }
    } catch (e) {
      this.goTo('LoggedOut')
      debugging && console.log('loggedout6')
    }
  }

  async isExpired(fbkToken){
    const response = await fetch(`https://graph.facebook.com/oauth/access_token_info?access_token=${fbkToken}`)
    let res = await response.json()
    return res
  }
// WARNING WHEN LOGGING IN, cannot call setState/forceUpdate on an Unmounted component
  goTo(screen){
    setTimeout(()=>{
      this.props.navigation.navigate(screen)
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

const mapStateToProps = state => ({
  userId: state.user.id,
  gcToken: state.tokens.gc,
  fbkToken: state.tokens.fbk
})

const AuthStateWithData = compose(
  graphql(GetUser,{
    name: 'getUser',
    options: ({userId}) => ({
      variables: { userId },
      fetchPolicy: 'network-only'
    })
  })
)(AuthState)

export default connect(mapStateToProps,{ updateUser,setShopper,setShoppersDistributors,setDistributor })(AuthStateWithData)
