

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
import { FontLato,FontMatilde,FontPoiret } from '../assets/fonts/Fonts'
import { AppName } from '../config/Defaults'

const getDimensions = () => {
  let { height, width } = Dimensions.get("window")
  let dimensions = {width,height}
  return dimensions
}

const err = (title='',problem='',message='',br='') => {
  Alert.alert(
    `This ${title} Screen is Misbehaving!`,
    `${br}${"\n"}Can we blame the "Inter Webs"?${"\n"}Joking aside, ${problem}.${"\n"}${br}${"\n"}${message}`
  )
}

class Modals extends Component {
  constructor(props){
    super(props)
  }

  renderModal(){
    let type = this.props.type ? this.props.type : null
    if (type === 'processing') {
      return (
        <DotsLoader
          size={15}
          color={Colors.pink}
          frequency={5000}/>
      )
    } else if (type === 'error') {
      let { title,description,message } = this.props.content
      return (
        <View
          onPress={this.props.close}
          style={{
            ...Views.middleNoFlex,
            width:.85*getDimensions().width,
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
            width:.85*getDimensions().width,
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
    }
  }

  render(){
    return (
      <Modal
        isVisible={this.props.isOpen}
        backdropColor={Colors.blue}
        backdropOpacity={0.7}>
          <View style={{...Views.middle}}>
            {this.renderModal()}
          </View>
      </Modal>
    )
  }
}

const clearIdentifiers = () => {
  AsyncStorage.multiRemove(['fbkToken','gcToken','userId'], (e) => {
    if (e) {
      err('Loading',`${AppName} is having a hard time clearing old data. Please force quit ${AppName} and re-open.`,e.message)
    }
  })
}

export { getDimensions,err,Modals,clearIdentifiers }
// ${"\n"}${br}${"\n"}
