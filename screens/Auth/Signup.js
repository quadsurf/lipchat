

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//LIBS
import { withNavigation } from 'react-navigation'
import { DotsLoader } from 'react-native-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { debounce } from 'underscore'

//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'
import { err,Modals } from '../../utils/Helpers'

class Signup extends Component {

  constructor(props){
    super(props)
    this.navBack = debounce(this.navBack,1000,true)
  }

  navBack(){
    this.props.navigation.goBack()
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingVertical:16}}>
        <View style={{...Views.middle,marginTop:20}}>
          <FontPoiret text="This Screen is meant for your" size={Texts.large.fontSize}/>
          <FontPoiret text="Shoppers to help them reserve" size={Texts.large.fontSize}/>
          <FontPoiret text="Colors from your Inventory" size={Texts.large.fontSize}/>
          <MaterialCommunityIcons
            name="ray-start-end"
            size={30}
            color={Colors.transparentWhite}
            style={{marginVertical:24}}
            onPress={() => this.navBack()}/>
          <FontPoiret text="In order to keep you in" size={Texts.large.fontSize}/>
          <FontPoiret text="compliance, this is not a" size={Texts.large.fontSize}/>
          <FontPoiret text="shopping cart ordering system," size={Texts.large.fontSize}/>
          <FontPoiret text="but rather, a way for them to" size={Texts.large.fontSize}/>
          <FontPoiret text="reserve and deduct colors" size={Texts.large.fontSize}/>
          <FontPoiret text="from your inventory and" size={Texts.large.fontSize}/>
          <FontPoiret text="improve communication." size={Texts.large.fontSize}/>
        </View>
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <FontPoiret text="Signup" size={Texts.xlarge.fontSize}/>
        {this.renderMainContent()}
      </View>
    )
  }

}

export default withNavigation(Signup)
