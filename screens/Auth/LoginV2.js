

// import Expo, { Components,Util } from 'expo'
import Expo from 'expo'
import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableHighlight,
  ImageBackground,
  AsyncStorage
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import Swiper from 'react-native-swiper'

//LOCALS
import { Colors,Views,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { getDimensions,Modals } from '../../utils/Helpers'
import { terms } from '../../config/Defaults'

//ENV VARS
import { FBK_APP_ID } from 'react-native-dotenv'

//GQL
import { AuthenticateFacebookUser } from '../../api/db/mutations'

//STORE
import { resetApp } from '../../store/actions'

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
        },700)
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
        activeDotColor={Colors.pinkly}
        height={getDimensions().height}
        width={getDimensions().width}
        >
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/splash.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter,marginBottom:this.state.bottomMargin}}>
              <FontPoiret text="Find Your Sexy" size={48} underline={true} />
              <FontPoiret text="overlay lip colors" size={32} />
              <FontPoiret text="onto your selfie" size={32} />
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/water-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="waterproof" size={68} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/kiss-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="kissproof" />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/smudge-proof.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="smudgeproof" size={57} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/cruelty-free.jpg')}
            style={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="cruelty-free," size={63} />
              <FontPoiret text="lead-free," size={64} />
              <FontPoiret text="vegan..." size={64} />
              <FontPoiret text="nuff said!" size={64} />
              {this.renderFacebookButton()}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
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
    const { type, token:fbkToken } = await Expo.Facebook.logInWithReadPermissionsAsync(
      FBK_APP_ID,
      {
        permissions: ['public_profile','email','user_friends'],
        behavior: 'web'
      }
    )
    if (type === 'success') {
      this.showModal('processing')
      const res = await fetch(`https://graph.facebook.com/v2.9/me?fields=id,first_name,last_name,age_range,gender,picture,verified,email,friends&access_token=${fbkToken}`)
      let fbkUser = await res.json()
      if (fbkUser) {
        this.getOrCreateUser(fbkUser,fbkToken)
      } else {
        this.showModal('error','Intro',"We couldn't retrieve or save your Facebook details.")
      }
    } else if (type === 'cancel') {
      this.showModal('error','Intro',"Why would you do that? Tisk, tisk! A valid and verified Facebook account is needed.")
    }
  }

  getOrCreateUser(facebookUser,fbkToken){
    let errText = "getting or creating an account for you in the Database"
    let fbkUser = JSON.stringify(facebookUser)
    if (fbkUser) {
      this.props.authenticateFacebookUser({
        variables: {
          fbkUser
        }
      }).then( ({ data: { authenticateFacebookUser:res=null } }) => {
        if (res) {
          let gc = res.token.gctoken
          let id = res.token.user.id
          AsyncStorage.multiSet([
            ['tokens',JSON.stringify({gc,fbk:fbkToken})],
            ['user',JSON.stringify({id})]
          ],(e)=>{
            if (e) {
              this.showModal('error','Intro','There was a problem saving your access to your phone.')
            } else {
              this.props.resetApp()
            }
          })
        } else {
          this.openError(`${errText}-1`)
        }
      }).catch( e => {
        this.openError(`${errText}-2`)
      })
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

const LoginWithData = compose(
  graphql(AuthenticateFacebookUser,{
    name: 'authenticateFacebookUser'
  })
)(Login)

export default connect(null,{ resetApp })(LoginWithData)
