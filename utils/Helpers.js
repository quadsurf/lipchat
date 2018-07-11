

import React, { Component } from 'react'
import { EvilIcons,Entypo } from '@expo/vector-icons'
import {
  Dimensions,
  Alert,
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  AsyncStorage
} from 'react-native'

//LIBS
import Modal from 'react-native-modal'
import { DotsLoader } from 'react-native-indicator'

//LOCALS
import { Colors,Views,Texts } from '../css/Styles'
import { FontLato,FontMatilde,FontPoiret } from '../screens/common/fonts'
import { AppName } from '../config/Defaults'

// CONSTS
const large = Texts.large.fontSize
const debugging = __DEV__ && false

const convertRGBStringIntoArrayOfNumbers = rgbString => {
  let colorCodes = rgbString.split(',')
  let rgbStringAsArrayOfNumbers = []
  colorCodes.forEach( colorCode => {
    rgbStringAsArrayOfNumbers.push(parseInt(colorCode.match(/\d/g).join('')))
  })
  if (rgbStringAsArrayOfNumbers.length === 4) rgbStringAsArrayOfNumbers.pop()
  return rgbStringAsArrayOfNumbers
}

const getDimensions = () => {
  let { height, width } = Dimensions.get("window")
  let dimensions = {width,height}
  return dimensions
}

const { width } = Dimensions.get("window")

const err = (title='',problem='',message='',br='') => {
  Alert.alert(
    `This ${title} Screen is Misbehaving!`,
    `${br}${"\n"}Can we blame the "Inter Webs"?${"\n"}Joking aside, ${problem}.${"\n"}${br}${"\n"}${message}`
  )
}

const isSsl = (url) => {
  let el4 = url.split('')[4]
  if (el4 === 's') {
    return true
  } else {
    return false
  }
}

const shortenUrl = (text='',length) => {
  let url = text.split('')
  let shortened = url.splice(8,url.length).join('')
  if (shortened.length > length) {
    let textArray = shortened.split('')
    shortened = textArray.splice(0,length).join('')
    return `${shortened}...`
  } else {
    return shortened
  }
}

const clipText = (text='',length) => {
  if (text.length > length) {
    let textArray = text.split('')
    let shortened = textArray.splice(0,length).join('')
    return `${shortened}...`
  } else {
    return text
  }
}

class Modals extends Component {
  constructor(props){
    super(props)
  }

  state = {
    isVisible: this.props.isOpen
  }

  componentWillReceiveProps(newProps){
    if (newProps.hasOwnProperty('isOpen') && newProps.isOpen !== this.state.isVisible) {
      this.setState({ isVisible:newProps.isOpen })
    }
  }

  renderModal(){
    let type = this.props.type ? this.props.type : null
    if (type === 'sending') {
      return null
    } else if (type === 'processing') {
      return (
        <View
          style={{...Views.middle}}>
          <DotsLoader
            size={15}
            color={Colors.purple}
            frequency={5000}/>
        </View>
      )
    } else if (type === 'err') {
      let { title,description } = this.props.content
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width:.85*width,
            backgroundColor: Colors.purple,
            borderRadius: 15,
            padding: 20,
            maxHeight: 400
          }}>
          <FontPoiret text={`${title} Issue`} size={Texts.large.fontSize} color={Colors.blue}/>
          <ScrollView style={{marginTop:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              {`Apologies, but something prevented ${AppName} from ${description}. We were notified of this error, and will be working on a fix for it.${"\n\n"}Please try again though!`}
            </Text>
          </ScrollView>
          <TouchableHighlight
            style={{
              width: 100,
              height: 50,
              position: 'absolute',
              bottom: -50,
              backgroundColor: Colors.purple,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              ...Views.middleNoFlex
            }}
            onPress={this.props.close}
            underlayColor={Colors.purple}>
            <EvilIcons name="close" size={32} color={Colors.blue} />
          </TouchableHighlight>
        </View>
      )
    } else if (type === 'error') {
      let { title,description,message } = this.props.content
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width:.85*width,
            backgroundColor: Colors.purple,
            borderRadius: 15,
            padding: 20,
            maxHeight: 400
          }}>
          <FontPoiret text={`${title} Screen Issue`} size={Texts.large.fontSize} color={Colors.blue}/>
          <ScrollView style={{marginTop:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              {`${description} ${message}${"\n"}${"\n"}Please try again though!`}
            </Text>
          </ScrollView>
          <TouchableHighlight
            style={{
              width: 100,
              height: 50,
              position: 'absolute',
              bottom: -50,
              backgroundColor: Colors.purple,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              ...Views.middleNoFlex
            }}
            onPress={this.props.close}
            underlayColor={Colors.purple}>
            <EvilIcons name="close" size={32} color={Colors.blue} />
          </TouchableHighlight>
        </View>
      )
    } else if (type === 'prompt') {
      let { title,description } = this.props.content
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width:.85*width,
            backgroundColor: Colors.purple,
            borderRadius: 15,
            padding: 20,
            maxHeight: 400
          }}>
          <FontPoiret text={title} size={Texts.large.fontSize} color={Colors.blue}/>
          <ScrollView style={{marginTop:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              {description}
            </Text>
          </ScrollView>
          <TouchableHighlight
            style={{
              width: 100,
              height: 50,
              position: 'absolute',
              bottom: -50,
              backgroundColor: Colors.purple,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              ...Views.middleNoFlex
            }}
            onPress={this.props.close}
            underlayColor={Colors.purple}>
            <Entypo name="check" size={32} color={Colors.blue} />
          </TouchableHighlight>
        </View>
      )
    } else if (type === 'submit') {
      let { title } = this.props.content
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width:.85*width,
            backgroundColor: Colors.purple,
            borderRadius: 15,
            padding: 20,
            maxHeight: 400
          }}>
          <ScrollView style={{marginTop:10}}>
            {title}
          </ScrollView>
          <TouchableHighlight
            style={{
              width: 100,
              height: 50,
              position: 'absolute',
              bottom: -50,
              backgroundColor: Colors.purple,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              ...Views.middleNoFlex
            }}
            onPress={this.props.close}
            underlayColor={Colors.purple}>
            <Entypo name="check" size={32} color={Colors.blue} />
          </TouchableHighlight>
        </View>
      )
    } else if (type === 'confirm') {
      let { title,description,onConfirmPress } = this.props.content
      let modalWidth = width*.85
      // let modalHeight = getDimensions().height*.75
      let button = {
        width:modalWidth-40,height:50,justifyContent:'center',alignItems:'center',borderRadius:6,backgroundColor:Colors.blue,marginTop:18,marginBottom:10
      }
      let buttonText = {fontFamily:'Poiret',fontSize:large}
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width: modalWidth,
            backgroundColor: Colors.purple,
            borderRadius: 15,
            padding: 20,
            maxHeight: 420
          }}>
          <FontPoiret text={title} size={Texts.large.fontSize} color={Colors.blue}/>
          <ScrollView style={{marginTop:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              {description}
            </Text>
          </ScrollView>
          <TouchableHighlight
            onPress={onConfirmPress}
            underlayColor={Colors.pinkly} style={{...button}}>
            <Text style={{...buttonText,color:Colors.purple}}>confirm</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{
              width: 100,
              height: 50,
              position: 'absolute',
              bottom: -50,
              backgroundColor: Colors.purple,
              borderBottomLeftRadius: 50,
              borderBottomRightRadius: 50,
              ...Views.middleNoFlex
            }}
            onPress={this.props.close}
            underlayColor={Colors.purple}>
            <EvilIcons name="close" size={32} color={Colors.blue} />
          </TouchableHighlight>
        </View>
      )
    }
  }

  closeModal = () => {
    this.setState({ isVisible:false })
  }

  render(){
    return (
      <Modal
        isVisible={this.state.isVisible}
        backdropColor={Colors.blue}
        backdropOpacity={0.7}
        onBackdropPress={this.closeModal}
        useNativeDriver={true}>
          <View style={{...Views.middle}}>
            {this.renderModal()}
          </View>
      </Modal>
    )
  }
}

// ADD REDUX CLEARING ALSO, OR MOVE TO REDUX HANDLING
const clearIdentifiers = () => {
  AsyncStorage.multiRemove(['fbkToken','gcToken','userId'], (e) => {
    if (e) {
      err('Loading',`${AppName} is having a hard time clearing old data. Please force quit ${AppName} and re-open.`)
    }
  })
}

const getGQLerror = e => {
  if (debugging) console.log('e',e);
  const errors = e.graphQLErrors[0]
  if (debugging) console.log('e array',errors);
  const messages = []

  if (errors.hasOwnProperty('functionError')) {
    const customErrors = JSON.parse(errors.functionError)
    messages.push(...customErrors.errors)
  } else {
    messages.push(errors.message)
  }
  return messages[0]
}

export {
  convertRGBStringIntoArrayOfNumbers,getDimensions,shortenUrl,
  clipText,Modals,clearIdentifiers,getGQLerror,err
}
