

import React, { Component } from 'react'
import { View,AsyncStorage } from 'react-native'

// LIBS
import {  compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'

// LOCALS
import { Views,Colors } from '../../css/Styles'
import { AppName } from '../../config/Defaults'
import { updateUser } from '../../store/actions'

//GQL
import { GetUser } from '../../api/db/queries'

//CONSTs
const debugging = __DEV__ && false

class AuthState extends Component {

  constructor(props){
    super(props)
    this.state = {
      user: null
    }
    this.determineAuthStatus = debounce(this.determineAuthStatus,750,true)
  }
  
  componentWillReceiveProps(newProps){
    if (!newProps.getUser.loading) {
      if (newProps.getUser.User) {
        if (newProps.getUser.User !== this.state.user) {
          this.props.updateUser(newProps.getUser.User)
          this.setState({
            user: newProps.getUser.User
          },()=>{
            this.determineAuthStatus()
          })
        }
      } else if (newProps.getUser.error) {
        debugging && console.log('loggedout8')
        console.log(newProps.getUser.error);
        this.determineAuthStatus()
      } else {
        debugging && console.log('loggedout9')
        this.determineAuthStatus()
      }
    }
  }

  async determineAuthStatus(){
    if (this.state.user) {
      try {
        let { fbkToken,gcToken } = this.props
        if (fbkToken && gcToken) {
          let tokenStatus = await this.isExpired(fbkToken)
          if (tokenStatus) {
            if (tokenStatus.expires_in) {
              // > 259200
              if (tokenStatus.expires_in > 259200) {
                debugging && console.log('LoggedIn Redirect')
                this.goTo('LoggedIn')
              } else {
                debugging && console.log('loggedout1')
                this.goTo('LoggedOut')
              }
            } else if (tokenStatus.error) {
              debugging && console.log('loggedout2')
              this.goTo('LoggedOut')
            } else {
              debugging && console.log('loggedout3')
              this.goTo('LoggedOut')
            }
          } else {
            debugging && console.log('loggedout4')
            this.goTo('LoggedOut')
          }
        } else {
          debugging && console.log('loggedout5')
          this.goTo('LoggedOut')
        }
      } catch (e) {
        debugging && console.log('loggedout6')
        this.goTo('LoggedOut')
      }
    } else {
      debugging && console.log('loggedout7')
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
      // localStorage: this.props.screenProps.localStorage
    }
    this.props.navigation.navigate(screen,passProps)
    // setTimeout(()=>{
    // 
    // },2000)
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

const AuthStateWithData = compose(
  graphql(GetUser,{
    name: 'getUser',
    options: (props) => ({
      variables: {
        userId: props.user.id
      },
      fetchPolicy: 'network-only'
    })
  })
)(AuthState)

const mapStateToProps = state => ({
  user: state.user,
  gcToken: state.tokens.gc,
  fbkToken: state.tokens.fbk
})

export default connect(mapStateToProps,{ updateUser })(AuthStateWithData)