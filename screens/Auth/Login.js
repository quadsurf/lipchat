

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
import PropTypes from 'prop-types'

//LOCALS
import { Colors,Views,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'
import { Modals } from '../../utils/Helpers'
import { terms } from '../../config/Defaults'

//ENV VARS
import { FBK_APP_ID } from 'react-native-dotenv'

//GQL
import { AuthenticateFacebookUser } from '../../api/db/mutations'
import { GetSettings } from '../../api/db/queries'

//STORE
import { clearUser,clearShopper,clearDistributor,resetApp } from '../../store/actions'

//CONSTs
const debugging = __DEV__ && false
const fbBaseUri = 'https://graph.facebook.com/v'
const fbUriParams = '/me?fields=id,first_name,last_name,picture,email&access_token='
const marginBottom = 60
//deprecated: friends,verified,gender,age_range

class Login extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    graphVersion: '3.0'
  }

  fullScreen() {
    return {
      ...Views.middle,
      backgroundColor: Colors.bgColor,
      width: this.props.settings.screenWidth
    }
  }

  componentDidMount(){
    this.props.clearUser()
    this.props.clearShopper()
    this.props.clearDistributor()
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getSettings
      && newProps.getSettings.allSettings
      && newProps.getSettings.allSettings.length > 0
    ) {
      let graphVersion = newProps.getSettings.allSettings[0].graph || this.state.graphVersion
      this.setState({ graphVersion })
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
    let { screenWidth:width,screenHeight:height } = this.props.settings
    return (
      <Swiper
        loop={false}
        showsPagination={true}
        index={0}
        activeDotColor={Colors.pinkly}
        height={height}
        width={width}
        >
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/splash.jpg')}
            style={{width,height}}>
            <View style={{...Views.bottomCenter,marginBottom}}>
              <FontPoiret text="Find Your Sexy" size={48} underline={true} />
              <FontPoiret text="overlay lip colors" size={32} />
              <FontPoiret text="onto your selfie" size={32} />
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/water-proof.jpg')}
            style={{width,height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="waterproof" size={68} />
              {this.renderButton('guest')}
              {this.renderButton('fb')}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/kiss-proof.jpg')}
            style={{width,height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="kissproof" />
              {this.renderButton('fb')}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/smudge-proof.jpg')}
            style={{width,height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="smudgeproof" size={57} />
              {this.renderButton('fb')}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
        <View style={{...Views.middle}}>
          <ImageBackground
            source={require('../../assets/images/cruelty-free.jpg')}
            style={{width,height}}>
            <View style={{...Views.bottomCenter}}>
              <FontPoiret text="cruelty-free," size={63} />
              <FontPoiret text="lead-free," size={64} />
              <FontPoiret text="vegan..." size={64} />
              <FontPoiret text="nuff said!" size={64} />
              {this.renderButton('fb')}
              {this.renderTermsPrivacy()}
            </View>
          </ImageBackground>
        </View>
      </Swiper>
    )
  }

  renderButton(mode){
    return (
      <View style={{
          width:this.props.settings.screenWidth,
          height:60,
          ...Views.middleNoFlex,
          marginBottom: mode === 'fb' ? marginBottom : 0
        }}>
        <TouchableHighlight
          style={{
            paddingVertical:12,
            paddingHorizontal:24,
            borderRadius:4,
            backgroundColor:Colors.purple
          }}
          underlayColor={Colors.purpleLight}
          onPress={() => mode === 'fb' ? this.logIn() : this.guest()}>
          <Text style={{
              color:Colors.bluergba,
              ...Texts.medium
            }}>
            {
              mode === 'fb' ? 'login with facebook' : 'browse as guest'
            }
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  async logIn() {
    const { type, token:fbkToken } = await Expo.Facebook.logInWithReadPermissionsAsync(
      FBK_APP_ID,
      {
        permissions: ['public_profile','email'],
        behavior: 'web'
      }
    )
    if (type === 'success') {
      this.showModal('processing')
      let fetchUri = `${fbBaseUri}${this.state.graphVersion}${fbUriParams}${fbkToken}`
      let res = await fetch(fetchUri)
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

  guest(){
    this.props.navigation.navigate('Guest')
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
        debugging && console.log('e',e.message)
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

Login.propTypes = {
  settings: PropTypes.object.isRequired,
  clearUser: PropTypes.func.isRequired,
  clearShopper: PropTypes.func.isRequired,
  clearDistributor: PropTypes.func.isRequired,
  resetApp: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings
})

const LoginWithData = compose(
  graphql(AuthenticateFacebookUser,{
    name: 'authenticateFacebookUser'
  }),
  graphql(GetSettings,{
    name: 'getSettings'
  })
)(Login)

export default connect(mapStateToProps,{
  clearUser,clearShopper,clearDistributor,resetApp
})(LoginWithData)
