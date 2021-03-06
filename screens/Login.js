

import Expo, { Components,Util } from 'expo'
import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableHighlight,
  Image,
  AsyncStorage
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import Swiper from 'react-native-swiper'

//LOCALS
import { Colors,Views,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import { getDimensions,Modals } from '../utils/Helpers'
import { terms } from '../config/Defaults'

//ENV VARS
import { FBK_APP_ID } from 'react-native-dotenv'

//GQL
import { AuthenticateFacebookUser,UpdateFbkFriends } from '../api/db/mutations'

class Login extends Component {

  state = {
    bottomMargin: 60,
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {}
  }

  fullScreen() {
    return {
      ...Views.middle,
      backgroundColor: Colors.bgColor,
      width: getDimensions().width
    }
  }

  componentWillReceiveProps(newProps){
    //
  }

  // if modalType='error', then pass at least the first 3 params below
  // if modalType='processing', then pass only modalType
  // if modalType='prompt', then pass TBD
  showModal(modalType,title,description,message=''){
    if (this.state.isModalOpen) {
      this.setState({isModalOpen:false},()=>{
        setTimeout(()=>{
          if (modalType && title) {
            this.setState({modalType,modalContent:{
              title,description,message
            }},()=>{
              this.setState({isModalOpen:true})
            })
          } else {
            this.setState({modalType},()=>{
              this.setState({isModalOpen:true})
            })
          }
        },600)
      })
    } else {
      if (modalType && title) {
        this.setState({modalType,modalContent:{
          title,description,message
        }},()=>{
          this.setState({isModalOpen:true})
        })
      } else {
        this.setState({modalType},()=>{
          this.setState({isModalOpen:true})
        })
      }
    }
  }

  renderModal(){
    return (
      <Modals
        isOpen={this.state.isModalOpen}
        close={() => this.setState({ isModalOpen:false })}
        type={this.state.modalType}
        content={this.state.modalContent}/>
    )
  }

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Login',errText)
      },700)
    })
  }

  render() {
    return (
      <View style={this.fullScreen()}>
        {this.renderSwipeScreens()}
        {this.renderModal()}
      </View>
    )
  }

  renderSwipeScreens(){
    return (
      <Swiper
        loop={false}
        showsPagination={true}
        index={0}
        activeDotColor={Colors.pink}
        height={getDimensions().height}
        width={getDimensions().width}
        >
        <View style={{...Views.middle}}>
          <Image
            source={require('../assets/images/splash.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter,marginBottom:this.state.bottomMargin}}>
              <FontPoiret text="Find Your Sexy" size={48} underline={true} />
              <FontPoiret text="overlay lip colors" size={32} />
              <FontPoiret text="onto your selfie" size={32} />
            </View>
          </Image>
        </View>
        <View style={{...Views.middle}}>
          <Image
            source={require('../assets/images/water-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="waterproof" size={68} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </Image>
        </View>
        <View style={{...Views.middle}}>
          <Image
            source={require('../assets/images/kiss-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="kissproof" />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </Image>
        </View>
        <View style={{...Views.middle}}>
          <Image
            source={require('../assets/images/smudge-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="smudgeproof" size={57} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </Image>
        </View>
        <View style={{...Views.middle}}>
          <Image
            source={require('../assets/images/cruelty-free.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="cruelty-free," size={63} />
              <FontPoiret text="lead-free," size={64} />
              <FontPoiret text="vegan..." size={64} />
              <FontPoiret text="nuff said!" size={64} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </Image>
        </View>
      </Swiper>
    )
  }

  renderFacebookButton(){
    return (
      <View style={{
          width:getDimensions().width,
          height:60,
          ...Views.middleNoFlex,
          marginBottom:this.state.bottomMargin
        }}>
        <TouchableHighlight
          style={{
            paddingVertical:12,
            paddingHorizontal:24,
            borderRadius:4,
            backgroundColor:Colors.purple
          }}
          underlayColor={Colors.purpleText}
          onPress={() => this.logIn()}>
          <Text style={{
              color:Colors.bluergba,
              ...Texts.medium
            }}>
            login with facebook
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  async logIn() {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(
      FBK_APP_ID,
      {
        permissions: ['public_profile','email','user_friends'],
        behavior: 'web'
      }
    )
    if (type === 'success') {
      this.showModal('processing')
      if (this.setItem('fbkToken',token)) {
        const response = await fetch(`https://graph.facebook.com/v2.9/me?fields=id,first_name,last_name,age_range,gender,picture,verified,email,friends&access_token=${token}`)
        let fbkUser = await response.json()
        if (fbkUser) {
          this.getOrCreateUser(fbkUser)
        } else {
          this.showModal('error','Intro',"We couldn't retrieve or save your Facebook details.")
        }
      }
    } else if (type === 'cancel') {
      this.showModal('error','Intro',"Why would you do that? Tisk, tisk! A valid and verified Facebook account is needed.")
    }
  }

  getOrCreateUser(facebookUser){
    let errText = "getting or creating an account for you in the Database"
    let fbkUser = JSON.stringify(facebookUser)
    if (fbkUser) {
      this.props.authenticateFacebookUser({
        variables: {
          fbkUser
        }
      }).then( response => {
        let res = response.data.authenticateFacebookUser || {}
        if (res) {
          let gcToken = res.token.gctoken
          let userId = res.token.user.id
          if (this.setItem('gcToken',gcToken)) {
            if (this.setItem('userId',userId)) {
              let localStorage = {gcToken,userId}
              this.updateFbkFriendsOnUser(userId,facebookUser.friends.data,localStorage)
            }
          }
        } else {
          this.openError(`${errText} (error code: 1-${fbkUser})`)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 2-${fbkUser})`)
      })
    }
  }

  async updateFbkFriendsOnUser(id,fbkFriends,localStorage){
    let errText = "updating your connections data"
    this.props.updateFbkFriends({
      variables: {
        userId: id,
        fbkFriends: fbkFriends
      }
    }).then( response => {
      let user = response.data.updateUser || {}
      if (user) {
        this.handleRedirect(user,localStorage)
      } else {
        this.openError(`${errText} (error code: 1-${id})`)
      }
    }).catch( e => {
      this.openError(`${errText} (error code: 2-${id})`)
    })
  }

  handleRedirect(user,localStorage){
    let passProps = {user,localStorage}
    setTimeout(()=>{
      this.setState({isModalOpen:false},()=>{
        // Util.reload()
        this.props.screenProps.handler()
        // this.props.navigation.navigate('LoggedIn',passProps)
      })
    },0)
  }

  async setItem(key,token){
    let infoType = (key == 'gcToken') ? 'Database' : 'Facebook'
    try {
      await AsyncStorage.setItem(key,token)
    } catch (e) {
      this.showModal('error','Intro',`We tried to add your ${infoType} info into a delicious cookie, but forgot the recipe!`,e.message)
      return false
    } finally {
      return true
    }
  }

  renderTermsPrivacy(){
    return (
      <Text
        onPress={() => this.showModal('prompt','Terms, Conditions, & Privacy',terms)}
        style={{
          position: 'absolute',
          bottom: 8,
          color: Colors.blue,
          ...Texts.small
        }}>
        Terms, Conditions, & Privacy
      </Text>
    )
  }

}

export default compose(
  graphql(AuthenticateFacebookUser,{
    name: 'authenticateFacebookUser'
  }),
  graphql(UpdateFbkFriends,{
    name: 'updateFbkFriends'
  })
)(Login)
// , just like on snapchat
