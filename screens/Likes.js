

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


//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'

class Likes extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
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
    let imageWidth = 280
    let vspace = 20
    let large = Texts.large.fontSize
    let xlarge = Texts.xlarge.fontSize
    let { fbkFirstName,fbkLastName,fbkUserId,cellPhone } = this.state.user
    let textInputStyle = {fontFamily:'Poiret',backgroundColor:Colors.bgColor,fontSize:large,color:Colors.blue}
    return (
        <View style={{...Views.middle}}>
          <ScrollView contentContainerStyle={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.middle,paddingVertical:40,paddingHorizontal:15}}>
              <FontPoiret text="Likes" size={xlarge} vspace={vspace}/>
            </View>
          </ScrollView>
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

}

export default Likes
// 10000048005
