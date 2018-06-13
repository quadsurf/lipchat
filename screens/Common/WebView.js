

import React, { Component } from 'react'
import { View,WebView,Linking,TouchableOpacity,Image } from 'react-native'

// LIBS
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'
// import { Entypo } from '@expo/vector-icons'chevron-thin-left
import { EvilIcons,MaterialIcons } from '@expo/vector-icons'
import { debounce } from 'underscore'
import call from 'react-native-phone-call'
import PropTypes from 'prop-types'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from './fonts'

// COMPs
import Loading from './Loading'

class BizUriWebView extends Component {

  constructor(props){
    super(props)
    this.unmountThisModalSafely = debounce(this.unmountThisModalSafely,2000,true)
    this.margin = 12
  }

  renderWebView(){
    let { formattedBizUri:bizUri } = this.props.navigation.state.params
    return (
      <View style={{flex:1,backgroundColor:'transparent'}}>
          {
            bizUri
             ? (
               <WebView
                 ref={ ref => this.webview = ref }
                 source={{ uri:bizUri }}
                 onNavigationStateChange={(event) => {
                   if (event.url !== bizUri) {
                     this.webview.stopLoading()
                     Linking.openURL(event.url)
                   }
                 }}
                 startInLoadingState={true}
                 renderLoading={() => <Loading/>}
                 style={{
                   flex:1,
                   backgroundColor:'transparent',
                   marginLeft:this.margin,
                   marginRight:this.margin,
                   marginBottom:this.margin
                 }}/>
             ) : (
               <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
                 <FontPoiret
                   size={Texts.medium.fontSize}
                   text="Apologies, but your Distributor has"/>
                 <FontPoiret
                   size={Texts.medium.fontSize}
                   text="not yet set up their profile link."/>
               </View>
             )
          }
      </View>
    )
  }

  unmountThisModalSafely(){
    this.props.navigation.goBack(null)
  }

  render(){
    let { formattedBizName:bizName,formattedLogoUri:logoUri,cellPhone } = this.props.navigation.state.params
    return (
      <View style={{flex:1,backgroundColor:Colors.bgColor}}>
        <View
          style={{
            width:this.props.screenWidth,
            height:80,
            flexDirection:'row',
            justifyContent:'space-between'
          }}>
            <View style={{justifyContent:'center'}}>
              <TouchableOpacity onPress={() => this.unmountThisModalSafely()}>
                <EvilIcons
                  name="close"
                  size={50}
                  style={{color:Colors.blue,marginLeft:6}}/>
              </TouchableOpacity>
            </View>
            <View style={{alignItems:'center'}}>
              <Image source={{uri:logoUri}} style={{width:50,height:50,borderRadius:25,marginTop:6}}/>
              <FontPoiret
                text={bizName}
                size={Texts.small.fontSize}
                style={{color:Colors.blue}}/>
            </View>
            <View style={{justifyContent:'center'}}>
              {
                cellPhone
                 ? (
                   <TouchableOpacity onPress={() => call({number:cellPhone,prompt:false})}>
                     <MaterialIcons
                       name="phone"
                       size={50}
                       style={{color:Colors.blue,marginRight:this.margin}}/>
                   </TouchableOpacity>
                 ) : (
                   <View>
                     <MaterialIcons
                       name="phone"
                       size={50}
                       style={{color:Colors.bgColor,marginRight:this.margin}}/>
                   </View>
                 )
              }
            </View>
        </View>
        {this.renderWebView()}
      </View>
    )
  }

}

BizUriWebView.propTypes = {
  screenWidth: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  screenWidth: state.settings.screenWidth
})

const BizUriWebViewWithStore = connect(mapStateToProps)(BizUriWebView)

export default withNavigation(BizUriWebViewWithStore)
