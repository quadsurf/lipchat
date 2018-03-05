

import { Camera,Permissions,FaceDetector,Svg } from 'expo'
import React, { Component } from 'react'
import {
  View,Text,TouchableOpacity,
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
    faces: []
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
    const renderLandmark = (position,coord) =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
            {
              backgroundColor: coord === 'mouth' ? 'yellow' : coord === 'bottom' ? 'green' : 'red'
            }
          ]}
        />
      )
    const renderTopLip = ({
      leftMouthPosition:{x:lx,y:ly},
      mouthPosition:{x:cx,y:cy},
      rightMouthPosition:{x:rx,y:ry},
      bottomMouthPosition:{x:bx,y:by}
    }) => {
      
      let topSteps = 10 // top lip's # of coordinates between landmarks
      let topRisesY = Math.round(.2*topSteps) // the # of initial y rises till y changes direction
      let topCenterY = cy - 6 // adjusted top center y
      
      // amount of progressive movement from one landmark to the next
      let topLeftRunRateX = (Math.abs(cx - lx))/topSteps
      let topLeftRunRateY = (Math.abs(topCenterY - ly))/topSteps
      let topRightRunRateX = (Math.abs(cx - rx))/topSteps
      let topRightRunRateY = (Math.abs(topCenterY - ry))/topSteps
      
      let topLeftXs = [cx]
      let topLeftYs = [topCenterY]
      let topRightXs = [cx]
      let topRightYs = [topCenterY]
      
      let topReducerArray = new Array(topSteps - 1)
      
      // X Reducers
      let topLeftXsReducer = (tally, curVal) => {
        let nextEl = tally - topLeftRunRateX
        topLeftXs.push(nextEl)
        return nextEl
      }
      let topRightXsReducer = (tally, curVal) => {
        let nextEl = tally + topRightRunRateX
        topRightXs.push(nextEl)
        return nextEl
      }
      
      // Y Reducers
      let topLeftYsReducer = (tally, curVal) => {
        let nextEl
        if (topLeftYs.length < topRisesY+1) {
          nextEl = tally - topLeftRunRateY
        } else {
          nextEl = tally + topLeftRunRateY
        }
        topLeftYs.push(nextEl)
        return nextEl
      }
      let topRightYsReducer = (tally, curVal) => {
        let nextEl
        if (topRightYs.length < topRisesY+1) {
          nextEl = tally - topRightRunRateY
        } else {
          nextEl = tally + topRightRunRateY
        }
        topRightYs.push(nextEl)
        return nextEl
      }
      
      topReducerArray.reduce(topLeftXsReducer,cx)
      topReducerArray.reduce(topLeftYsReducer,topCenterY)
      topReducerArray.reduce(topRightXsReducer,cx)
      topReducerArray.reduce(topRightYsReducer,topCenterY)
      
      // topLeftXs
      // topLeftYs
      // topRightXs
      // topRightYs
      console.log('topLeftXs',topLeftXs)
      console.log('topLeftYs',topLeftYs)
      
      let topLeftCoordsWOTrim = ''
      let topRightCoordsWOTrim = ''
      for (var i = 0; i < topLeftXs.length; i++) {
        topLeftCoordsWOTrim = `${topLeftCoordsWOTrim} ${topLeftXs[i].toFixed(0)},${topLeftYs[i].toFixed(0)}`
        topRightCoordsWOTrim = `${topRightCoordsWOTrim} ${topRightXs[i].toFixed(0)},${topRightYs[i].toFixed(0)}`
      }
      let topLeftCoords = topLeftCoordsWOTrim.trim()
      let topRightCoords = topRightCoordsWOTrim.trim()
      
      console.log('topLeftCoords',topLeftCoords)
      console.log('topRightCoords',topRightCoords)
      
      // let botSteps = 10 // bottom lip's # of coordinates between landmarks
      // let botCenterY = cy + 4 // adjusted bottom center y
      // let botReducerArray = new Array(botSteps - 1)
      
      let delta = 5
      let peakDeltaX = 10
      let peakDelatY = 6
      let tltcy = cy-delta
      let tlbcy = cy+delta
      let tlplx = cx-peakDeltaX
      let tlply = tltcy-peakDelatY
      let tlprx = cx+peakDeltaX
      let tlpry = tltcy-peakDelatY
      let lm = `${lx},${ly}`
      let tlpl = `${tlplx},${tlply}`
      let tltc = `${cx},${tltcy}`
      let tlpr = `${tlprx},${tlpry}`
      let rm = `${rx},${ry}`
      let tlbc = `${cx},${tlbcy}`
      // ${lm} ${tlpl} ${tltc} ${tlpr} ${rm} ${tlbc}
      return (
        <Svg
            width={screenWidth}
            height={screenHeight}
        >
            <Svg.Polygon
                points={`${topLeftCoords} ${topRightCoords} ${tlbc}`}
                fill="rgba(255,64,129,0.3)"
            />
        </Svg>
      )
    }
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderTopLip(face)}
      </View>
    )
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftMouthPosition,'left')}
        {renderLandmark(face.mouthPosition,'mouth')}
        {renderLandmark(face.rightMouthPosition,'right')}
        {renderLandmark(face.bottomMouthPosition,'bottom')}
      </View>
    )
  }
  // {renderLandmark(face.leftMouthPosition)}
  // {renderLandmark(face.mouthPosition)}
  // {renderLandmark(face.rightMouthPosition)}
  // {renderLandmark(face.bottomMouthPosition)}
  // <View
  //   style={[
  //     styles.landmark,
  //     {
  //       left: x,
  //       top: y
  //     }
  //   ]}
  // />
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
        {this.state.faces.map(this.renderLandmarksOfFace)}
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
      </Camera>
    )
  }

  render() {
    const cameraScreenContent = this.state.hasCameraPermission
      ? this.renderCamera()
      : this.renderNoPermissions()
    return <View style={styles.container}>{cameraScreenContent}</View>
  }
  
  // 
  // async detectFaces(imageUri){
  //   const options = {
  //     mode: FaceDetector.Constants.Mode.accurate,
  //     detectLandmarks: FaceDetector.Constants.Landmarks.all
  //   }
  //   return await FaceDetector.detectFaces(imageUri, options)
  // }

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
  
  renderNoPermissions() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        <FontPoiret text="no access to camera" size={Texts.large.fontSize}/>
      </View>
    )
  }

  // render(){
  //   return(
  //     <View style={{flex:1,backgroundColor:Colors.purple}}>
  //       <MyStatusBar hidden={false} />
  //       {this.renderCameraView()}
  //       {this.renderModal()}
  //     </View>
  //   )
  // }

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