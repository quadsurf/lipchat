

import React, { Component } from 'react'
import { View,Text,TouchableOpacity } from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { Camera, Permissions } from 'expo'

// GQL
import { GetColorsAndInventories } from '../api/db/queries'
import { CreateLike,UpdateDoesLikeOnLike } from '../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { Modals,getDimensions } from '../utils/Helpers'

// CONSTS
const large = Texts.large.fontSize
const { width:screenWidth,height:screenHeight } = getDimensions()
const debugging = false

class Selfie extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: [],
    userType: this.props.userType,
    hasCameraPermission: null,
    type: Camera.Constants.Type.back
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      if (newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors) {
        if (newProps.getColorsAndInventories.allColors !== this.state.colors) {
          let newColors = newProps.getColorsAndInventories.allColors
          let colors = []
          newColors.forEach( ({
            id:colorId,family,finish,name,rgb,
            status,tone,
            likesx:[like={}]
          }) => {
            let { id:likeId=null,doesLike=false } = like
            colors.push({
              colorId,family,finish,name,
              rgb: `rgb(${rgb})`,
              status,tone,
              likeId,doesLike
            })
          })
          this.setState({colors},()=>{
            if (debugging) console.log('this.state.colors:',this.state.colors)
          })
        }
      }
    }
  }

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

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Selfie',errText)
      },700)
    })
  }

  checkIfLikeExists(color={}){
    let { likeId,doesLike,colorId } = color
    let { id:shopperId } = this.props.user.shopperx
    if (likeId) {
      color.doesLike = !doesLike
      this.updateDoesLike(color)
    } else {
      this.createLikeInDb(shopperId,color)
    }
  }
  
  createLikeInDb(ShopperId,color){
    this.showModal('processing')
    let errText = 'creating a like for this color'
    let { colorId:ColorId } = color
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: {ShopperId,ColorId}
      }).then( ({ data: { createLike=null }=null }) => {
        if (createLike) {
          color.likeId = createLike.id
          color.doesLike = createLike.doesLike
          this.updateDoesLikeInApp(color)
          setTimeout(()=>{
            this.setState({isModalOpen:false})
          },1400)
        } else {
          this.openError(`${errText} (error code: 1-${ShopperId}-${ColorId})`)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 2-${ShopperId}-${ColorId}, message: ${e.message})`)
      })
    } else {
      this.openError(`${errText} (error code: 3-${ShopperId}-${ColorId})`)
    }
  }
  
  updateDoesLike(color){
    this.updateDoesLikeInApp(color)
    this.updateDoesLikeInDb(color)
  }
  
  updateDoesLikeInApp(color){
    let { colors } = this.state
    let index = colors.findIndex( el => {
      return el.colorId === color.colorId
    })
    if (index !== -1) {
      colors.splice(index,1,color)
      this.setState({colors})
    }
  }
  
  updateDoesLikeInDb(color){
    let {likeId:LikeId,doesLike:bool,colorId} = color
    let errText = 'updating the like status for this color'
    if (LikeId) {
      this.props.updateDoesLikeOnLike({
        variables: {LikeId,bool}
      }).then( ({ data: { updateLike=null }=null }) => {
        if (updateLike) {
          let { colors } = this.state
          let index = colors.findIndex( el => {
            return el.colorId === colorId
          })
          if (index !== -1) {
            if (this.state.colors[index].doesLike !== updateLike.doesLike) {
              this.openError(`${errText} (error code: 1-${LikeId}-${bool})`)
              color.doesLike = updateLike.doesLike
              this.updateDoesLikeInApp(color)
            }
          }
        } else {
          this.openError(`${errText} (error code: 2-${LikeId}-${bool})`)
          color.doesLike = !color.doesLike
          this.updateDoesLikeInApp(color)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 3-${LikeId}-${bool}, message: ${e.message})`)
        color.doesLike = !color.doesLike
        this.updateDoesLikeInApp(color)
      })
    } else {
      this.openError(`${errText} (error code: 4-${LikeId}-${bool})`)
      color.doesLike = !color.doesLike
      this.updateDoesLikeInApp(color)
    }
  }

  renderCameraView(){
    const { hasCameraPermission } = this.state
    if (hasCameraPermission === null) {
      return <View />
    } else if (hasCameraPermission === false) {
      return <FontPoiret text="no access to camera" size={Texts.large.fontSize}/>
    } else {
      return (
        <Camera style={{flex:1}} type={Camera.Constants.Type.front}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <FontPoiret text="Manpreet, work your magic!!!" size={Texts.large.fontSize}/>
          </View>
        </Camera>
      )
    }
  }
  
  render(){
    return(
      <View style={{flex:1,backgroundColor:Colors.purple}}>
        <MyStatusBar hidden={false} />
        {this.renderCameraView()}
        {this.renderModal()}
      </View>
    )
  }

}

export default compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx ? props.user.distributorx.id : "",
        shopperxId: props.user.shopperx ? props.user.shopperx.id : ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(CreateLike,{
    name: 'createLike'
  }),
  graphql(UpdateDoesLikeOnLike,{
    name: 'updateDoesLikeOnLike'
  })
)(Selfie)