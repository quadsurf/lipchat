

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableHighlight
} from 'react-native'

//LIBS
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'
import { err,Modals } from '../../utils/Helpers'
import { exitDemoButtonText } from '../../config/Defaults'

@withNavigation
class Signup extends Component {

  constructor(props){
    super(props)
    this.navBack = debounce(this.navBack,1000,true)
  }

  navBack(){
    this.props.navigation.goBack()
  }

  renderSeparator(){
    return (
      <MaterialCommunityIcons
        name="ray-start-end"
        size={30}
        color={Colors.transparentWhite}
        style={{marginVertical:6}}/>
    )
  }

  renderMainContent(){
    let button = {
      width:this.props.screenWidth-100,height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:6,
      backgroundColor:Colors.blue,
      marginVertical: 0,
      alignSelf: 'center'
      // marginTop:18,marginBottom:10
    }
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingVertical:16}}>
        <View style={{...Views.middle,marginTop:0}}>
          { this.renderSeparator() }
          <FontPoiret text="SHOPPERS" size={Texts.larger.fontSize}/>
          <FontPoiret text="favorite colors" size={Texts.medium.fontSize}/>
          <FontPoiret text="link to your distributor" size={Texts.medium.fontSize}/>
          <FontPoiret text="chat with your distributor 1-on-1" size={Texts.medium.fontSize}/>
          <FontPoiret text="chat in your distributor's group chat" size={Texts.medium.fontSize}/>
          <FontPoiret text="claim/reserve colors from distributor's inventory" size={Texts.medium.fontSize}/>
          { this.renderSeparator() }
          <FontPoiret text="DISTRIBUTORS" size={Texts.larger.fontSize}/>
          <FontPoiret text="increase sales" size={Texts.medium.fontSize}/>
          <FontPoiret text="custom branding" size={Texts.medium.fontSize}/>
          <FontPoiret text="track your inventory" size={Texts.medium.fontSize}/>
          <FontPoiret text="chat direct with a shopper" size={Texts.medium.fontSize}/>
          <FontPoiret text="group chat with all your shoppers" size={Texts.medium.fontSize}/>
          <FontPoiret text="promote all your social destinations (Tap.Bio)" size={Texts.medium.fontSize}/>
          <FontPoiret text="shoppers claim/reserve colors from your inventory" size={Texts.medium.fontSize}/>
          { this.renderSeparator() }
        </View>
        <TouchableHighlight
          onPress={() => this.navBack()}
          underlayColor={Colors.pinkly} style={{...button}}>
          <Text style={{fontFamily:'Poiret',fontSize:Texts.large.fontSize,color:Colors.purple}}>
            { exitDemoButtonText }
          </Text>
        </TouchableHighlight>
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

Signup.propTypes = {
  screenWidth: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  screenWidth: state.settings.screenWidth
})

export default connect(mapStateToProps,null)(Signup)
