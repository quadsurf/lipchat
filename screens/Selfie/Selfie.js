

import { Camera,Permissions,FaceDetector,Svg } from 'expo'
import React, { Component } from 'react'
import {
  View,Text,TouchableOpacity,
  ScrollView,Vibration
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
// import isIPhoneX from 'react-native-is-iphonex'
import { debounce } from 'underscore'

// STORE
import { connect } from 'react-redux'
import { setColors } from './store/actions'

// GQL
import { GetColorsAndInventories } from '../../api/db/queries'
import { CreateLike,UpdateDoesLikeOnLike } from '../../api/db/mutations'
import { GetLikesForShopper } from './../../api/db/queries'
import { SubToLikesForShopper } from './../../api/db/pubsub'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Modals,getDimensions } from '../../utils/Helpers'
import styles from './Styles'
import { tips,distIsLiking } from './../../config/Defaults'

// COMPONENTS
import ColorSwatch from './ColorSwatch'
import { Switch } from '../Common'
import Liker from './Liker'

// CONSTS
const large = Texts.large.fontSize
const { width:screenWidth,height:screenHeight } = getDimensions()
const debugging = false
const landmarkSize = 2
const layersModeAlpha = 0.2
const singleCoatAlpha = 0.6
const shortUIdebounce = 2000
const longUIdebounce = 3000

class Selfie extends Component {

  constructor(props){
    super(props)
    this.state = {
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
      activeColor: 'rgba(0,0,0,0)',
      layersMode: false,
      selectedColors: [],
      likesOfSelectedColors: []
    }
    this.checkIfLikeExists = debounce(this.checkIfLikeExists.bind(this),shortUIdebounce,true)
    this.onColorPress = debounce(this.onColorPress.bind(this),longUIdebounce,true)
    this.toggleLayersMode = debounce(this.toggleLayersMode,longUIdebounce,true)
  }
  
  subToLikesInDb(){
    if (this.props.userType === 'SHOPPER') {
      this.props.getLikesForShopper.subscribeToMore({
        document: SubToLikesForShopper,
        variables: {
          shopperId: { id: this.props.user.shopperx.id }
        },
        updateQuery: (previous,{ subscriptionData }) => {
          const { node={},mutation='' } = subscriptionData.data.Like
          if (mutation === 'CREATED' || mutation === 'UPDATED') {
            if (node.hasOwnProperty('id')) this.updateLikeOnColorsList(node)
          }
        }
      })
    }
  }
  
  updateLikeOnColorsList(node){
    let { colors } = this.state
    let i = colors.findIndex(({colorId}) => colorId === node.colorx.id)
    if (i !== -1) {
      if (colors[i].doesLike !== node.doesLike) {
        colors[i].likeId = node.id
        colors[i].doesLike = node.doesLike
        this.setState({colors},() => this.updateLikesOfSelectedColors())
      } else {
        this.updateLikesOfSelectedColors()
      }
    }
  }
  
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }
  
  componentDidMount(){
    this.subToLikesInDb()
  }
  
  onFacesDetected = ({ faces }) => this.setState({ faces })
  onFaceDetectionError = state => console.warn('Faces detection error:', state)

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
  
  updateLikesOfSelectedColors(){
    let likesOfSelectedColors = []
    this.state.selectedColors.forEach( id => {
      let color = this.getColorObj(id)
      likesOfSelectedColors.push(color)
    })
    this.setState({likesOfSelectedColors})
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
      return colors.map(color => this.renderLiker(color))
    } else {
      return <View/>
    }
  }
  
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
              {this.renderSwatches()}
            </ScrollView>
            <View style={{
              position: 'absolute',
              bottom: 66,
              left: 0,
              width:screenWidth*0.7,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}>
              {this.renderLikers(this.state.likesOfSelectedColors)}
            </View>
            <View style={{
              flexDirection:'row',position:'absolute',
              top:30,left:5,borderRadius:24,
              backgroundColor: Colors.transparentPurple,
              alignItems: 'center',paddingHorizontal:12
            }}>
              <FontPoiret text="Single Coat" size={Texts.medium.fontSize} />
              <Switch 
                checked={this.state.layersMode}
                onSwitchPress={() => this.toggleLayersMode()}/>
              <FontPoiret text="Layers Mode" size={Texts.medium.fontSize} />
            </View>
            <TouchableOpacity 
              style={{
              position:'absolute',
              top:(screenHeight/2)-36,
              left:5,borderRadius:24,
              backgroundColor: Colors.transparentPurple,
              alignItems: 'center',paddingHorizontal:12,
              paddingVertical:14
              }} 
              onPress={() => this.showModal(
                'prompt',
                'A Better Experience',
                tips
              )}>
              <FontPoiret text="Tips" size={Texts.medium.fontSize} />
            </TouchableOpacity>
            {this.renderModal()}
      </Camera>
    )
  }
  // ensure subscriptions on selfie.js and lipcolors.js adhere to new color model's data shape
  // USE CONSTRUCTOR TO BIND ANON FUNCS in Selfie and You.js
  // CHATS.js needs a manual loader
  // ADJUST LIP SHAPE
  // ABILITY TO TOGGLE DIST'S DEFAULT APPROVED STATUS
  // ADD VERSIONING
  // ADD PUSH NOTIFICATIONS
  getLayeredRGB(rgb,rgbNumbers,op){
    let red,green,blue,alpha,rgba
    if (rgbNumbers.length > 0) {
      if (rgbNumbers.length === 3) {
        if (op === '-') {
          red = Math.round( (rgbNumbers[0][0] + rgbNumbers[1][0] + rgbNumbers[2][0] - rgb[0]) / 2 )
          green = Math.round( (rgbNumbers[0][1] + rgbNumbers[1][1] + rgbNumbers[2][1] - rgb[1]) / 2 )
          blue = Math.round( (rgbNumbers[0][2] + rgbNumbers[1][2] + rgbNumbers[2][2] - rgb[2]) / 2 )
          alpha = Number.parseFloat(layersModeAlpha * 2).toFixed(1)
        }
      }
      if (rgbNumbers.length === 2) {
        if (op === '+') {
          red = Math.round( (rgbNumbers[0][0] + rgbNumbers[1][0] + rgb[0]) / 3 )
          green = Math.round( (rgbNumbers[0][1] + rgbNumbers[1][1] + rgb[1]) / 3 )
          blue = Math.round( (rgbNumbers[0][2] + rgbNumbers[1][2] + rgb[2]) / 3 )
          alpha = Number.parseFloat(layersModeAlpha * 3).toFixed(1)
        } else {
          red = Math.round(rgbNumbers[0][0] + rgbNumbers[1][0] - rgb[0])
          green = Math.round(rgbNumbers[0][1] + rgbNumbers[1][1] - rgb[1])
          blue = Math.round(rgbNumbers[0][2] + rgbNumbers[1][2] - rgb[2])
          alpha = Number.parseFloat(layersModeAlpha).toFixed(1)
        }
      }
      if (rgbNumbers.length === 1) {
        if (op === '+') {
          red = Math.round( (rgbNumbers[0][0] + rgb[0]) / 2 )
          green = Math.round( (rgbNumbers[0][1] + rgb[1]) / 2 )
          blue = Math.round( (rgbNumbers[0][2] + rgb[2]) / 2 )
          alpha = Number.parseFloat(layersModeAlpha * 2).toFixed(1)
        } else {
          red = 0
          green = 0
          blue = 0
          alpha = 0
        }
      }
      rgba = `rgba(${red},${green},${blue},${alpha})`
    } else {
      rgba = `rgba(${rgb},${layersModeAlpha})`
    }
    return rgba
  }
  
  createArrayOfRGBStrings(arr){
    let matches = []
    arr.forEach( selectedColorId => {
      this.state.colors.forEach( color => {
        if (color.colorId === selectedColorId) {
          matches.push(color.rgb)
        }
      })
    })
    return matches
  }
  
  async consolidateRGBs(arrayOfRgbNumbers,op){
    let matches = await this.createArrayOfRGBStrings(this.state.selectedColors)
    let rgbNumbers = []
    await matches.forEach( async match => {
      let rgbNumber = await this.splitRGBStringIntoArrayOfNumbers(match)
      rgbNumbers.push(rgbNumber)
    })
    let mergedRGBs = await this.getLayeredRGB(arrayOfRgbNumbers,rgbNumbers,op)
    return mergedRGBs
  }
  
  splitRGBStringIntoArrayOfNumbers(rgbString){
    let colorCodes = rgbString.split(',')
    let arrayOfRgbNumbers = []
    colorCodes.forEach( colorCode => {
    	arrayOfRgbNumbers.push(parseInt(colorCode.match(/\d/g).join('')))
    })
    if (arrayOfRgbNumbers.length === 4) arrayOfRgbNumbers.pop()
    return arrayOfRgbNumbers
  }
  
  async getNewRGB(rgbString,op){
    let newRGB
    if (!rgbString) {
      let { activeColor } = this.state
      if (activeColor === 'rgba(0,0,0,0)') {
        newRGB = activeColor
      } else {
        let arr = await this.splitRGBStringIntoArrayOfNumbers(activeColor)
        newRGB = `rgba(${arr[0]},${arr[1]},${arr[2]},${layersModeAlpha})`
      }
      return newRGB
    } else {
      let arrayOfRgbNumbers = await this.splitRGBStringIntoArrayOfNumbers(rgbString)
      newRGB = await this.consolidateRGBs(arrayOfRgbNumbers,op)
      return newRGB
    }
  }
  
  async onColorPress(colorId,rgbString){
    // this.showModal('processing')
    let { selectedColors,layersMode } = this.state
    // run check to see if color is selected already
    let i = selectedColors.findIndex( selectedColorId => selectedColorId === colorId )
    let activeColor
    if (i === -1) {
      // color is not selected
      if (!layersMode) {
        selectedColors = []
        activeColor = `rgba(${rgbString},${singleCoatAlpha})`
      } else {
        // in layers mode
        if (selectedColors.length >= 3) {
          Vibration.vibrate()
          // setTimeout(()=>{
          //   this.setState({isModalOpen:false})
          // },1400)
        } else {
          activeColor = await this.getNewRGB(rgbString,'+')
        }
      }
      selectedColors.push(colorId)
    } else {
      // color is selected
      // ARE WE REMOVING COLOR OR STRENGTHENING COLOR???
      if (!layersMode) {
        activeColor = 'rgba(0,0,0,0)'
      } else {
        activeColor = await this.getNewRGB(rgbString,'-')
      }
      selectedColors.splice(i,1)
    }
    this.setState({
      activeColor,
      selectedColors: [...selectedColors]
    },()=>{
      this.updateLikesOfSelectedColors()
      // setTimeout(()=>{
      //   this.setState({isModalOpen:false})
      // },1400)
    })
  }
  
  async toggleLayersMode(){
    if (this.state.layersMode) {
      this.setState({layersMode:false})
      let { selectedColors,likesOfSelectedColors } = this.state
      let activeColor
      if (selectedColors.length > 0) {
        let rgb = await this.createArrayOfRGBStrings([selectedColors[0]])[0]
        activeColor = `rgba(${rgb},${singleCoatAlpha})`
      }
      this.setState({
        selectedColors: selectedColors.length > 0 ? [selectedColors[0]] : [],
        activeColor: selectedColors.length > 0 ? activeColor : 'rgba(0,0,0,0)',
        likesOfSelectedColors: likesOfSelectedColors.length > 0 ? [likesOfSelectedColors[0]] : []
      })
    } else {
      // singleCoatMode
      this.setState({layersMode:true})
      let activeColor = await this.getNewRGB(null)
      this.setState({activeColor})
    }
  }
  
  renderSwatch({ name,rgb,colorId,doesLike }){
    let isSelected = this.state.selectedColors.findIndex( selectedColorId => selectedColorId === colorId )
    return (
      <ColorSwatch 
        key={colorId} 
        colorId={colorId}
        name={name} 
        rgb={rgb} 
        isSelected={isSelected === -1 ? false : true}
        doesLike={this.props.userType === 'SHOPPER' ? doesLike : false}
        onColorPress={this.onColorPress} />
    )
  }
  
  renderSwatches(){
    let { colors } = this.state
    if (colors && colors.length > 0) {
      return colors.map(color => this.renderSwatch(color))
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
  
  componentWillReceiveProps(newProps){
    if (newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors) {
      if (newProps.getColorsAndInventories.allColors !== this.state.colors) {
        let newColors = newProps.getColorsAndInventories.allColors
        let colors = []
        newColors.forEach( ({
          id:colorId,family,finish,name,rgb,
          status,tone,
          likesx:[like={}],
          inventoriesx:[inventory={}]
        }) => {
          let { id:likeId=null,doesLike=false } = like
          let { id:inventoryId=null,count=0 } = inventory
          colors.push({
            colorId,
            family:family.toLowerCase(),
            finish,name,rgb,
            status,tone,
            likeId,doesLike,
            inventoryId,count
          })
        })
        this.setState({colors},()=>{
          this.props.setColors(this.state.colors)
          debugging && console.log('this.state.colors:',this.state.colors)
        })
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

  checkIfLikeExists(color){
    if (this.props.userType === 'SHOPPER') {
      let { likeId,doesLike,colorId } = color
      let { id:shopperId } = this.props.user.shopperx
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
        this.updateLikesOfSelectedColors()
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
        <FontPoiret text="no access to camera" size={Texts.large.fontSize}/>
      </View>
    )
  }

}

const SelfieWithData = compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx.id,
        shopperxId: props.user.shopperx.id
      },
      fetchPolicy: 'network-only'
    })
  }),
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
        shopperId: { id: props.user.shopperx.id }
      }
    })
  })
)(Selfie)

export default connect(null,{setColors})(SelfieWithData)