

import React, { Component } from 'react'
import {
  Text,
  View,
  AsyncStorage,
  Image,
  ScrollView,
  TextInput
} from 'react-native'

//LIBS
import KeyboardSpacer from 'react-native-keyboard-spacer'

//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'

class You extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    text: 'go pro now'
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
    if (this.state.text !== nextState.text) {return true}
    return false
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

  renderMainContent(){
    // dynamic image sizing | vertical spacing | ScrollView | keypad lib
    let imageWidth = 280
    let vspace = 20
    let large = Texts.large.fontSize
    let { fbkFirstName,fbkLastName,fbkUserId,cellPhone } = this.state.user
    let textInputStyle = {fontFamily:'Poiret',backgroundColor:Colors.bgColor,fontSize:large,color:Colors.blue}
    console.log('cellPhone',cellPhone);
    return (
        <View style={{...Views.middle}}>
          <ScrollView contentContainerStyle={{width:getDimensions().width}}>
            <View style={{...Views.middle,paddingVertical:40,paddingHorizontal:15}}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`}}/>
              <FontPoiret text={`${fbkFirstName} ${fbkLastName}`} size={40} vspace={vspace}/>
              <FontPoiret text={ cellPhone ? cellphone : 'add cell phone' } size={large} vspace={vspace} onPress={() => this.updateCellPhone()}/>
              <FontPoiret text="logout" size={large} vspace={vspace} onPress={() => this.logOut()}/>
              <TextInput value={this.state.text} placeholder={this.state.text} style={textInputStyle}
                onChangeText={(text) => this.setState({text})}
                keyboardType="numeric"
                onSubmitEditing={() => this.updateCellPhone()}
                selectTextOnFocus={true}
                returnKeyType="done"/>
            </View>
          </ScrollView>
          <KeyboardSpacer/>
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

  updateCellPhone(){
    console.log('updateCellPhone func called');
  }

}

export default You
// 10000048005
