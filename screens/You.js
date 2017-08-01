

import React, { Component } from 'react'
import {
  Text,
  View,
  AsyncStorage,
  Image
} from 'react-native'

//LIBS


//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,clearIdentifiers } from '../utils/Helpers'

class You extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user
  }

  shouldComponentUpdate(nextProps,nextState){
    // if (this.props !== nextProps) {
    //   return true
    // }
    // if (this.state !== nextState) {
    //   return true
    // }
    if (this.state.isModalOpen !== nextState.isModalOpen) {
      return true
    }
    return false
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

  renderMainContent(){
    let { fbkFirstName,fbkLastName,fbkUserId } = this.state.user
    return (
      <View style={{...Views.middle}}>
        <Image
          style={{width:300,height:300,borderRadius:150}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=300&height=300`}}/>
        <FontPoiret text={`${fbkFirstName} ${fbkLastName}`} style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
          <Text onPress={() => this.logOut()} style={{...Texts.large,color:Colors.blue}}>
            logout
          </Text>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  async logOut(){
    try {
      this.showModal('processing')
      AsyncStorage.multiRemove(['fbkToken','gcToken','userId'], (e) => {
        if (e) {
          //
        } else {
          setTimeout(()=>{
            this.setState({ isModalOpen:false },()=>{
              this.props.nav.navigate('LoggedOut')
            })
          },2000)
        }
      })
    } catch(e) {
      this.setState({ isModalOpen:false },()=>{
        this.showModal('error','Profile','We tried to log you out, but your subsconsciousness stopped us.',e.message)
      })
    }
  }

}

export default You
// 10000048005
