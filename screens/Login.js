

import Expo, { Components } from 'expo'
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

  componentWillReceiveProps(newProps){
    console.log('newProps received');
    console.log(newProps)
  }

  fullScreen() {
    return {
      ...Views.middle,
      backgroundColor: Colors.bgColor,
      width: getDimensions().width
    }
  }

  // if modalType='error', then pass at least the first 3 params below
  // if modalType='processing', then pass only modalType
  // if modalType='prompt', then pass TBD
  showModal(modalType,title,description,message=''){
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

  renderModal(){
    return (
      <Modals
        isOpen={this.state.isModalOpen}
        close={() => this.setState({ isModalOpen:false })}
        type={this.state.modalType}
        content={this.state.modalContent}/>
    )
  }

  render() {
    return (
      <View style={this.fullScreen()}>
        <StatusBar hidden={true}/>
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
              <FontPoiret text={`overlay lip colors${"\n"}onto your selfie`} size={32} />
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
          underlayColor={Colors.black}
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
          this.setState({ isModalOpen: false },()=>{
            this.showModal('error','Intro',"We couldn't retrieve or save your Facebook details.")
          })
        }
      }
    } else if (type === 'cancel') {
      this.showModal('error','Intro',"Why would you do that? Tisk, tisk! A valid and verified Facebook account is needed.")
    }
  }

  getOrCreateUser(facebookUser){
    let fbkUser = JSON.stringify(facebookUser)
    this.props.authenticateFacebookUser({
      variables: {
        fbkUser
      }
    }).then( response => {
      let res = response.data.authenticateFacebookUser
      if (response.data.errors > 0) {
        this.setState({isModalOpen:false},()=>{
          this.showModal('error','Intro',"Could not retrieve or create an account for you in the Database.")
        })
      } else {
        let gcToken = res.token.gctoken
        let userId = res.token.user.id
        if (this.setItem('gcToken',gcToken)) {
          if (this.setItem('userId',userId)) {
            this.updateFbkFriendsOnUser(userId,facebookUser.friends.data)
          }
        }
      }
    })
  }

  updateFbkFriendsOnUser(id,fbkFriends){
    this.props.updateFbkFriends({
      variables: {
        userId: id,
        fbkFriends: fbkFriends
      }
    }).then( response => {
      console.log('then response from updateFbkFriends func');
      console.log(response);
      let res = response.data.updateUser
      if (response.data.errors > 0) {
        this.setState({isModalOpen:false},()=>{
          this.showModal('error','Intro','An attempt to update your new data, failed.')
        })
      } else {
        this.handleRedirect(res)
      }
    })
  }

  handleRedirect(user){
    let passProps = {user}
    console.log('made it to handleRedirect func with this user: ',passProps)
    this.props.navigation.navigate('LoggedIn',passProps)
  }

  async setItem(key,token){
    let infoType = (key == 'gcToken') ? 'Database' : 'Facebook'
    try {
      await AsyncStorage.setItem(key,token)
    } catch (e) {
      this.setState({ isModalOpen: false },()=>{
        this.showModal('error','Intro',`We tried to add your ${infoType} info into a delicious cookie, but forgot the recipe!`,e.message)
      })
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
