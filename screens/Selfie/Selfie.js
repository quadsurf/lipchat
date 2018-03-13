

import { Camera,Permissions,FaceDetector,Svg } from 'expo'
import React, { Component } from 'react'
import {
  View,Text,TouchableOpacity,
  ScrollView,
  Slider,Vibration
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import isIPhoneX from 'react-native-is-iphonex'

// GQL
import { GetColorsAndInventories } from '../../api/db/queries'
import { CreateLike,UpdateDoesLikeOnLike } from '../../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'
import styles from './Styles'

import ColorListItem from './ColorListItem'

// CONSTS
const large = Texts.large.fontSize
const { width:screenWidth,height:screenHeight } = getDimensions()
const debugging = false
const landmarkSize = 2

class Selfie extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: [],
    userType: this.props.userType,
    hasCameraPermission: false,
    photoId: 1,
    photos: [],
    faces: [],
    activeAlpha: 0.6,
    activeColor: 'rgba(0,0,0,0)',
    layersMode: false,
    selectedColors: []
  }
  
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }
  
  onFacesDetected = ({ faces }) => this.setState({ faces })
  onFaceDetectionError = state => console.warn('Faces detection error:', state)

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    )
  }

  renderLandmarksOfFace(face) {
    const renderTopLip = ({
      leftMouthPosition:{x:lx,y:ly},
      mouthPosition:{x:cx,y:cy},
      rightMouthPosition:{x:rx,y:ry},
      bottomMouthPosition:{x:bx,y:by}
    }) => {
      // UPPER LIP
      // adjustments
      let acxUpper = cx // adjusted center x
      let tacyUpper = cy - 8 // top adjusted center y
      let bacyUpper = cy + 6 // bottom adjusted center y
      let alx = lx - 9 // adjusted left x
      let aly = ly // adjusted left y
      let arx = rx + 9 // adjusted right x
      let ary = ry // adjusted right y
      
      // landmark coords
      let lm = `${alx},${aly}`
      let topCenterOfUpper = `${acxUpper},${tacyUpper}`
      let rm = `${arx},${ary}`
      
      // top of upper lip
      let top_alrOffsetX = 7 // control point distance from alx/arx
      let alrOffsetY = 9 // control point distance from aly/ary
      let acxOffset = 20 // control point distance from acxUpper
      let tacyUpperOffset = 28 // control point distance from acy
      
      // bottom of upper lip
      let bot_alrOffsetX = 20 // control point distance from alx/arx
      let bot_alrOffsetY = 10 // control point distance from aly/ary
      let bacyUpperOffset = 3 // control point distance from bacyUpper
      let acxUpperEndPoint = 16 // end point distance from acxUpper
      let acxUpperOffset = acxUpperEndPoint * 3 // control point distance from acxUpper
      
      // upper lip regions
      let tlUpper = `C${alx+top_alrOffsetX},${aly+alrOffsetY} 
                      ${acxUpper-acxOffset},${tacyUpper-tacyUpperOffset} 
                      ${topCenterOfUpper}`
      let trUpper = `C${acxUpper+acxOffset},${tacyUpper-tacyUpperOffset} 
                      ${arx-top_alrOffsetX},${ary+alrOffsetY} 
                      ${rm}`
      let brUpper = `C${arx-bot_alrOffsetX},${ary+bot_alrOffsetY} 
                      ${acxUpper+acxUpperOffset},${bacyUpper-bacyUpperOffset} ${acxUpper+acxUpperEndPoint},${bacyUpper}`
      let bMidUpper = `C${acxUpper},${bacyUpper+bacyUpperOffset} 
                      ${acxUpper},${bacyUpper+bacyUpperOffset} 
                      ${acxUpper-acxUpperEndPoint},${bacyUpper}`
      let blUpper = `C${acxUpper-acxUpperOffset},${bacyUpper-bacyUpperOffset} 
                      ${alx+bot_alrOffsetX},${aly+bot_alrOffsetY} 
                      ${lm}`
      
      // LOWER LIP
      // adjustments
      let acxLower = bx // bottom center of lower lip (X)
      let bacyLower = by // bottom center of lower lip (Y)
      let tacyLower = bacyLower - 25 // height of the lower lip
      
      // defaults
      
      // bottom lip regions
      let tlLower = `C${alx+bot_alrOffsetX},${aly+bot_alrOffsetY} 
                      ${acxLower-acxUpperOffset},${tacyLower-bacyUpperOffset} 
                      ${acxUpper-acxUpperEndPoint},${tacyLower}`
      let tMidLower = `C${acxLower},${tacyLower+bacyUpperOffset} 
                        ${acxLower},${tacyLower+bacyUpperOffset} 
                        ${acxLower+acxUpperEndPoint},${tacyLower}`
      let trLower = `C${acxLower+acxUpperOffset},${tacyLower-bacyUpperOffset} 
                      ${arx-bot_alrOffsetX},${aly+bot_alrOffsetY}
                      ${rm}`
      let brLower = `C${arx},${ary+((bacyLower-ary)/2)} 
                      ${acxLower+((arx-acxLower)/2)},${bacyLower} 
                      ${acxLower},${bacyLower}`
      let blLower = `C${acxLower-((acxLower-alx)/2)},${bacyLower} 
                      ${alx},${ary+((bacyLower-aly)/2)} 
                      ${lm}`
      let { activeColor } = this.state
      return (
        <Svg
          width={screenWidth}
          height={screenHeight}
        >
          <Svg.Path
              fill={activeColor}
              d={`M${lm} ${tlUpper} ${trUpper} ${brUpper} ${bMidUpper} ${blUpper}`}
          />
          <Svg.Path
              fill={activeColor}
              d={`M${lm} ${tlLower} ${tMidLower} ${trLower} ${brLower} ${blLower}`}
          />
        </Svg>
      )
    }
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderTopLip(face)}
      </View>
    )
  }
  
  renderFaces() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(this.renderFace)}
      </View>
    )
  }

  renderLandmarks() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map((face) => this.renderLandmarksOfFace(face))}
      </View>
    )
  }

  renderCamera() {
    // {this.renderFaces()}
    return (
      <Camera
        ref={ref => this.camera = ref}
        style={{flex: 1}}
        type={Camera.Constants.Type.front}
        flashMode="off"
        autoFocus="on"
        zoom={0}
        whiteBalance="auto"
        ratio="16:9"
        faceDetectionLandmarks={FaceDetector.Constants.Landmarks.all}
        faceDetectionMode={FaceDetector.Constants.Mode.fast}
        onFacesDetected={this.onFacesDetected}
        onFaceDetectionError={this.onFaceDetectionError}
        focusDepth={0}>
        {this.renderLandmarks()}
        <ScrollView contentContainerStyle={{
          height:((this.state.colors.length+1)*60),
          alignSelf: 'flex-end'
        }}>
          {this.renderColors()}
        </ScrollView>
      </Camera>
    )
  }
  
  onPressColor(colorId,rgb){
    let { layersMode } = this.state
    let i = this.state.selectedColors.findIndex( selectedColorId => {
      return selectedColorId === colorId
    })
    let { selectedColors } = this.state
    let activeColor
    if (i === -1) {
      if (!layersMode) {
        selectedColors = []
      }
      selectedColors.push(colorId)
      activeColor = `rgba(${rgb},${this.state.activeAlpha})`
    } else {
      selectedColors.splice(i,1)
      activeColor = 'rgba(0,0,0,0)'
    }
    this.setState({
      activeColor,
      selectedColors: [...selectedColors]
    })
  }
  
  renderColor({ name,rgb,colorId,doesLike }){
    let isSelected = this.state.selectedColors.findIndex( selectedColorId => {
      return selectedColorId === colorId
    })
    return (
      <ColorListItem 
        key={colorId} 
        name={name} 
        rgb={rgb} 
        isSelected={isSelected === -1 ? false : true}
        doesLike={doesLike}
        onPressColor={() => this.onPressColor(colorId,rgb)} />
    )
  }
  
  renderColors(){
    let { colors } = this.state
    if (colors && colors.length > 0) {
      return colors.map((color) => this.renderColor(color))
    }
  }

  render() {
    const cameraScreenContent = this.state.hasCameraPermission
      ? this.renderCamera()
      : this.renderNoPermissions()
    return (
      <View style={{flex:1,backgroundColor:Colors.purple}}>
        <MyStatusBar hidden={false} />
        <View style={styles.container}>
          {cameraScreenContent}
        </View>
        {this.renderModal()}
      </View>
    )
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
              colorId,family,finish,name,rgb,
              status,tone,
              likeId,doesLike
            })
          })
          this.setState({colors},()=>{
            debugging && console.log('this.state.colors:',this.state.colors)
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

  renderNoPermissions() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        <FontPoiret text="no access to camera" size={Texts.large.fontSize}/>
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