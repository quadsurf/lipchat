

import React, { Component } from 'react'
import { View,AsyncStorage } from 'react-native'

// LIBS
import {  compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'

// STORE
import { updateUser,setShopper,setDistributor } from '../../store/actions'

// LOCALS
import { Views,Colors } from '../../css/Styles'
import { AppName } from '../../config/Defaults'

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
          let newUser = { ...newProps.getUser.User }
          this.props.setShopper(newUser.shopperx)
          this.props.setDistributor(newUser.distributorx)
          delete newUser.distributorx
          delete newUser.shopperx
          this.props.updateUser(newUser)
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
  user: state.user,
  gcToken: state.tokens.gc,
  fbkToken: state.tokens.fbk
})

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

export default connect(mapStateToProps,{ updateUser,setShopper,setDistributor })(AuthStateWithData)