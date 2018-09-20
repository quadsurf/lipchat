

import { Camera,Permissions,FaceDetector,Svg } from 'expo'
import React, { Component } from 'react'
import {
  View,Text,TouchableOpacity,
  ScrollView,Vibration,FlatList,Alert
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { CreateLike,UpdateDoesLikeOnLike } from '../../api/db/mutations'
import { GetLikesForShopper } from './../../api/db/queries'
import { SubToLikesForShopper } from './../../api/db/pubsub'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'
import { convertRGBStringIntoArrayOfNumbers,Modals,getDimensions } from '../../utils/Helpers'
import styles from './Styles'
import { tips,distIsLiking } from './../../config/Defaults'

// COMPONENTS
import ColorSwatch from './ColorSwatch'
import { Switch } from '../common/components'
import Icon from '../common/Icon'
import Liker from './Liker'

// CONSTS
const large = Texts.large.fontSize
const { width:screenWidth,height:screenHeight } = getDimensions()
const debugging = __DEV__ && false
const landmarkSize = 2
const layersModeAlpha = 0.2
const singleCoatAlpha = 0.6
const shortUIdebounce = 500
const longUIdebounce = 2000

class Selfie extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      colors: [],
      hasCameraPermission: false,
      photoId: 1,
      photos: [],
      faces: [],
      activeColor: 'rgba(0,0,0,0)',
      layersMode: false,
      selectedColors: [],
      testColors: [],
      lastTapped: '',
      isRefreshing: true
    }
    this.checkIfLikeExists = debounce(this.checkIfLikeExists.bind(this),shortUIdebounce,true)
    this.onColorPress = debounce(this.onColorPress.bind(this),shortUIdebounce,true)
    this.toggleLayersMode = debounce(this.toggleLayersMode,longUIdebounce,true)
    this.renderSwatch = this.renderSwatch.bind(this)
  }

  subToLikesInDb(){
    if (this.props.userType !== 'DIST') {
      let { shopperId } = this.props
      if (shopperId) {
        this.props.getLikesForShopper.subscribeToMore({
          document: SubToLikesForShopper,
          variables: { shopperId: { id:shopperId } },
          updateQuery: (previous,{ subscriptionData }) => {
            const { node={},mutation='' } = subscriptionData.data.Like
            if (mutation === 'CREATED' || mutation === 'UPDATED') {
              if (node.hasOwnProperty('id')) this.updateLikeOnColorsList(node)
            }
          }
        })
      }
    }
  }

  updateLikeOnColorsList(node){
    let { colors } = this.state
    let i = colors.findIndex( ({colorId}) => colorId === node.colorx.id )
    if (i !== -1) {
      if (colors[i].doesLike !== node.doesLike) {
        colors[i].likeId = node.id
        colors[i].doesLike = node.doesLike
        this.setState({colors},() => this.syncSelectedColorsWithStateColors())
      } else {
        this.syncSelectedColorsWithStateColors()
      }
    }
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission: status === 'granted',
      colors: this.props.colors
    })
  }

  componentDidMount(){
    this.subToLikesInDb()
  }

  onFacesDetected = ({ faces }) => this.setState({ faces })
  onFaceDetectionError = state => Alert.alert('Face Detection Error',JSON.stringify(state))

  renderLandmarksOfFace(face) {
    const renderLips = ({
      leftMouthPosition:{x:lx,y:ly},
      mouthPosition:{x:cx,y:cy},
      rightMouthPosition:{x:rx,y:ry},
      bottomMouthPosition:{x:bx,y:by}
    }) => {
      // UPPER LIP
      // adjustments
      let acxUpper = cx // adjusted center x
      let alx = lx - 9 // adjusted left x
      let aly = ly // adjusted left y
      let arx = rx + 9 // adjusted right x
      let ary = ry // adjusted right y
      let mw = arx - alx // mouthWidth
      let tacyUpper = cy - (.04*mw) // top adjusted center y
      let bacyUpper = cy + (.03*mw) // bottom adjusted center y

      // landmark coords
      let lm = `${alx},${aly}`
      let topCenterOfUpper = `${acxUpper},${tacyUpper}`
      let rm = `${arx},${ary}`

      // top of upper lip
      let top_alrOffsetX = .035*mw //7 control point distance from alx/arx
      let alrOffsetY = .045*mw //9 control point distance from aly/ary
      let acxOffset = .17*mw //20 control point distance from acxUpper
      let tacyUpperOffset = .21*mw //28 control point distance from acy

      // bottom of upper lip
      let bot_alrOffsetX = .1*mw//20 // control point distance from alx/arx
      let bot_alrOffsetY = .05*mw//10 // control point distance from aly/ary
      let bacyUpperOffset = .015*mw//3 // control point distance from bacyUpper
      let acxUpperEndPoint = .08*mw//16 // end point distance from acxUpper
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

      // height of the lower lip
      let tacyLower = bacyLower - (mw*.2)

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
      let upper = `M${lm} ${tlUpper} ${trUpper} ${brUpper} ${bMidUpper} ${blUpper}`
      let lower = `M${lm} ${tlLower} ${tMidLower} ${trLower} ${brLower} ${blLower}`
      return (
        <Svg
          width={screenWidth}
          height={screenHeight}
        >
          <Svg.Path
              fill={activeColor}
              d={upper}
          />
          <Svg.Path
              fill={activeColor}
              d={lower}
          />
        </Svg>
      )
    }
    if (face.hasOwnProperty('mouthPosition')) {
      return (
        <View key={`landmarks-${face.faceID}`}>
          {renderLips(face)}
        </View>
      )
    } else {
      return null
    }
  }

  renderLandmarks() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map((face) => this.renderLandmarksOfFace(face))}
      </View>
    )
  }

  getColorObj(id){
    return this.state.colors.find( ({colorId}) => colorId === id)
  }

  syncSelectedColorsWithStateColors(){
    let newSelectedColors = []
    let { selectedColors,colors } = this.state
    selectedColors.forEach( ({ colorId:selectedColorId }) => {
      let found = colors.filter( ({ colorId }) => colorId === selectedColorId )
      if (found.length > 0) newSelectedColors.push(found[0])
    })
    this.setState({selectedColors:newSelectedColors})
  }

  renderLiker(color){
    return (
      <Liker
        key={color.colorId}
        color={color}
        onLikePress={this.checkIfLikeExists}/>
    )
  }

  renderLikers(colors){
    if (colors && colors.length > 0) {
      return colors.map( color => this.renderLiker(color) )
    } else {
      return <View/>
    }
  }

  renderColorTest(){
    if (this.props.userType !== 'SADVR') {
      return null
    } else {
      return (
        <View style={{
          position:'absolute',
          top: this.props.isIPhoneX ? 88 : 50,
          left: 5,
          width: 280,
          backgroundColor:Colors.transparentPurple,
          alignItems:'flex-start',
          padding: 12
        }}>
          <Text style={{color:"white"}}>
            last tapped: {this.state.lastTapped || 'none yet'}{"\n"}
            activeColor: {this.state.activeColor}{"\n"}
            SELECTED COLORS:
          </Text>
          {
            this.state.selectedColors.map( ({colorId,rgb,name}) => (
              <Text
                key={colorId}
                style={{color:"white"}}>
                  {rgb} - {name}
              </Text>
            ))
          }
          {
            this.state.faces && (
              <Text style={{color:"white",fontSize:8}}>{JSON.stringify(this.state.faces)}</Text>
            )
          }
        </View>
      )
    }
  }

  renderSwatch({item}){
    let isSelected = this.state.selectedColors.findIndex(
      ({ colorId:selectedColorId }) => selectedColorId === item.colorId
    )
    return (
      <ColorSwatch
        color={item}
        isSelected={isSelected === -1 ? false : true}
        doesLike={this.props.userType !== 'DIST' ? item.doesLike : false}
        onColorPress={this.onColorPress} />
    )
  }

  // faceDetectionLandmarks={FaceDetector.Constants.Landmarks.all}
  // faceDetectionMode={FaceDetector.Constants.Mode.fast}

  renderCamera() {
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
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Mode.none
        }}
        onFacesDetected={this.onFacesDetected}
        onFaceDetectionError={this.onFaceDetectionError}
        focusDepth={0}>
            {this.renderLandmarks()}
            <FlatList
              data={this.state.colors}
              renderItem={this.renderSwatch}
              keyExtractor={({colorId}) => colorId}
              contentContainerStyle={{
                alignSelf: 'flex-end',
                paddingBottom: 62
              }}/>
            <View style={{
              position: 'absolute',
              bottom: 66,
              left: 0,
              width:screenWidth*0.7,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {this.renderLikers(this.state.selectedColors)}
            </View>
            <View style={{
              flexDirection: 'row',
              position:'absolute',
              top: this.props.isIPhoneX ? 44 : 5,
              left: 5,
              borderRadius: 24,
              backgroundColor: Colors.transparentPurple,
              alignItems: 'center',
              paddingHorizontal:12
            }}>
              <FontPoiret text="Single Coat" size={Texts.medium.fontSize} />
              <Switch
                checked={this.state.layersMode}
                onSwitchPress={() => this.toggleLayersMode()}/>
              <FontPoiret text="Layers Mode" size={Texts.medium.fontSize} color={Colors.pinkly} />
            </View>
            <TouchableOpacity
              style={{
              position:'absolute',
              top:(screenHeight/2)-36,
              width:40,height:40,
              left:5,borderRadius:20,
              backgroundColor: Colors.transparentPurple,
              justifyContent: 'center',
              alignItems: 'center'
              }}
              onPress={() => this.showModal(
                'prompt',
                'A Better Experience',
                tips
              )}>
                <Icon family="Entypo" name="warning" size={16}/>
            </TouchableOpacity>
            {this.renderColorTest()}
            {this.renderModal()}
      </Camera>
    )
  }

  getLayeredRGB(rgbs,rgbNumbers,op){
    // rgbs is rgbStringAsArrayOfNumbers
    // rgbNumbers is rgbs of selectedColors
    let red,green,blue,alpha
    if (rgbNumbers.length === 3) {
      red = Math.round( (rgbNumbers[0][0] + rgbNumbers[1][0] + rgbNumbers[2][0] - rgbs[0]) / 2 )
      green = Math.round( (rgbNumbers[0][1] + rgbNumbers[1][1] + rgbNumbers[2][1] - rgbs[1]) / 2 )
      blue = Math.round( (rgbNumbers[0][2] + rgbNumbers[1][2] + rgbNumbers[2][2] - rgbs[2]) / 2 )
      alpha = Number.parseFloat(layersModeAlpha * 2).toFixed(1)
    }
    else if (rgbNumbers.length === 2) {
      if (op === '+') {
        red = Math.round( (rgbNumbers[0][0] + rgbNumbers[1][0] + rgbs[0]) / 3 )
        green = Math.round( (rgbNumbers[0][1] + rgbNumbers[1][1] + rgbs[1]) / 3 )
        blue = Math.round( (rgbNumbers[0][2] + rgbNumbers[1][2] + rgbs[2]) / 3 )
        alpha = Number.parseFloat(layersModeAlpha * 3).toFixed(1)
      }
      if (op === '-') {
        red = Math.round( (rgbNumbers[0][0] + rgbNumbers[1][0] - rgbs[0]) )
        green = Math.round( (rgbNumbers[0][1] + rgbNumbers[1][1] - rgbs[1]) )
        blue = Math.round( (rgbNumbers[0][2] + rgbNumbers[1][2] - rgbs[2]) )
        alpha = Number.parseFloat(layersModeAlpha).toFixed(1)
      }
    }
    else if (rgbNumbers.length === 1) {
      if (op === '+') {
        red = Math.round( (rgbNumbers[0][0] + rgbs[0]) / 2 )
        green = Math.round( (rgbNumbers[0][1] + rgbs[1]) / 2 )
        blue = Math.round( (rgbNumbers[0][2] + rgbs[2]) / 2 )
        alpha = Number.parseFloat(layersModeAlpha * 2).toFixed(1)
      }
      if (op === '-') {
        red = 0
        green = 0
        blue = 0
        alpha = 0
      }
    }
    else if (rgbNumbers.length === 0) {
      red = rgbs[0]
      green = rgbs[1]
      blue = rgbs[2]
      alpha = Number.parseFloat(layersModeAlpha).toFixed(1)
    } else {
      red = 0
      green = 0
      blue = 0
      alpha = 0
    }
    return `rgba(${red},${green},${blue},${alpha})`
  }

  combineRgbsOfSelectedColors(arr){
    let rgbNumbersOfSelectedColors = []
    arr.forEach( ({ rgbs }) => {
      rgbNumbersOfSelectedColors.push(rgbs)
    })
    return rgbNumbersOfSelectedColors
  }

  async consolidateRGBs(rgbs,op,selectedColors){
    let rgbsOfSelectedColors = await this.combineRgbsOfSelectedColors(selectedColors)
    let mergedRGBs = await this.getLayeredRGB(rgbs,rgbsOfSelectedColors,op)
    return mergedRGBs
  }

  async getNewRGB(rgbStringAsArrayOfNumbers,op,selectedColors){
    let newRGB
    if (!rgbStringAsArrayOfNumbers) {
      // no rgbStringAsArrayOfNumbers means this came from mode toggler; purpose: preserve activeColor
      let { activeColor } = this.state
      if (activeColor === 'rgba(0,0,0,0)') {
        // no colors selected, preserve default activeColor
        return activeColor
      } else {
        // help activeColor survive layers mode toggling
        let arr = await convertRGBStringIntoArrayOfNumbers(activeColor)
        return `rgba(${arr[0]},${arr[1]},${arr[2]},${layersModeAlpha})`
      }
    } else {
      // has rgbStringAsArrayOfNumbers means this came from onColorPress
      newRGB = await this.consolidateRGBs(rgbStringAsArrayOfNumbers,op,selectedColors)
      return newRGB
    }
  }

  async onColorPress(color){
    let { selectedColors,layersMode } = this.state
    // run check to see if color is selected already
    let selectedColor = selectedColors.find( ({ colorId }) => colorId === color.colorId )
    let activeColor
    if (!selectedColor) {
      // color is not selected, so add it
      if (!layersMode) {
        // in single coat mode
        activeColor = `rgba(${color.rgb},${singleCoatAlpha})`
        this.updateSelectedColors(activeColor,[color],color)
      } else {
        // in layers mode
        if (selectedColors.length >= 3) {
          Vibration.vibrate()
        } else {
          activeColor = await this.getNewRGB(color.rgbs,'+',selectedColors)
          selectedColors.push(color)
          this.updateSelectedColors(activeColor,selectedColors,color)
        }
      }
    } else {
      // STRENGTHEN COLOR in V2???
      // color is selected, so remove it
      if (!layersMode) {
        // in single coat mode
        activeColor = 'rgba(0,0,0,0)'
        this.updateSelectedColors(activeColor,[],color)
      } else {
        // in layers mode
        let newSelectedColors = selectedColors.filter( ({ colorId }) => colorId !== selectedColor.colorId)
        activeColor = await this.getNewRGB(color.rgbs,'-',selectedColors)
        this.updateSelectedColors(activeColor,newSelectedColors,color)
      }
    }
  }

  updateSelectedColors(activeColor,selectedColors,color){
    this.setState({
      activeColor,
      selectedColors: [...selectedColors]
    },()=>{
      this.props.userType === 'SADVR' && this.lastTapped(color)
    })
  }

  // debugger function
  lastTapped({ rgb,name }){
    this.setState({lastTapped: `${rgb} - ${name}`})
  }

  async toggleLayersMode(){
    if (this.state.layersMode) {
      this.setState({layersMode:false})
      let { selectedColors } = this.state
      let activeColor
      let hasSelectedColors = selectedColors.length > 0 ? true : false
      if (hasSelectedColors) {
        activeColor = `rgba(${selectedColors[0].rgb},${singleCoatAlpha})`
      }
      this.setState({
        selectedColors: hasSelectedColors ? [selectedColors[0]] : [],
        activeColor: hasSelectedColors ? activeColor : 'rgba(0,0,0,0)'
      })
    } else {
      // singleCoatMode
      this.setState({layersMode:true})
      let activeColor = await this.getNewRGB(null)
      this.setState({activeColor})
    }
  }

  render() {
    const cameraScreenContent = this.state.hasCameraPermission
      ? this.renderCamera()
      : this.renderNoPermissions()
    return (
      <View style={{flex:1,backgroundColor:Colors.purple}}>
        <View style={{
          width:screenWidth,
          height:screenHeight
        }}>
          {cameraScreenContent}
        </View>
      </View>
    )
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

  checkIfLikeExists(color){
    if (this.props.userType !== 'DIST') {
      let { likeId,doesLike,colorId } = color
      let { shopperId } = this.props
      if (likeId) {
        color.doesLike = !doesLike
        this.updateDoesLike(color)
      } else {
        this.createLikeInDb(shopperId,color)
      }
    } else {
      this.showModal('prompt',"You're a Distributor",distIsLiking)
    }
  }

  createLikeInDb(ShopperId,color){
    // this.showModal('processing')
    let errText = 'creating a like for this color'
    let { colorId:ColorId } = color
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: {ShopperId,ColorId}
      }).then( ({ data: { createLike={} }=null }) => {
        if (createLike.hasOwnProperty('id')) {
          color.likeId = createLike.id
          color.doesLike = createLike.doesLike
          this.updateDoesLikeInApp(color)
          // setTimeout(()=>{
          //   this.setState({isModalOpen:false})
          // },1400)
        } else {
          this.openError(`${errText} (error code: 1-${ShopperId}-${ColorId})`)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 2-${ShopperId}-${ColorId})`)
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
    let i = colors.findIndex( ({colorId}) => colorId === color.colorId )
    if (i !== -1) {
      colors.splice(i,1,color)
      this.setState({colors},()=>{
        this.syncSelectedColorsWithStateColors()
      })
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
        this.openError(`${errText} (error code: 3-${LikeId}-${bool})`)
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
        <FontPoiret text="checking camera permissions" size={Texts.large.fontSize}/>
      </View>
    )
  }

}

Selfie.propTypes = {
  userType: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  isIPhoneX: PropTypes.bool.isRequired,
  colors: PropTypes.array.isRequired
}

const mapStateToProps = state => ({
  userType: state.user.type,
  shopperId: state.shopper.id,
  isIPhoneX: state.settings.isIPhoneX,
  colors: state.colors
})

const SelfieWithData = compose(
  graphql(CreateLike,{
    name: 'createLike'
  }),
  graphql(UpdateDoesLikeOnLike,{
    name: 'updateDoesLikeOnLike'
  }),
  graphql(GetLikesForShopper,{
    name: 'getLikesForShopper',
    options: props => ({
      variables: {
        shopperId: { id: props.shopperId }
      }
    })
  })
)(Selfie)

export default connect(mapStateToProps)(SelfieWithData)
