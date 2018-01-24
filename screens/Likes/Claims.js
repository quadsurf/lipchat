

import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

//LIBS
import { EvilIcons,Ionicons } from '@expo/vector-icons'
import { withNavigation } from 'react-navigation'
import { NavigationActions } from 'react-navigation'

//LOCALS
import { Views,Colors } from '../../css/Styles'
import { FontMatilde,FontPoiret } from '../../assets/fonts/Fonts'
import { getDimensions } from '../../utils/Helpers'

@withNavigation
class Claims extends Component {
  
  state = {
    count: 0
  }
  
  componentWillMount(){
    // console.log('nav on Claims.js: ',this.props.navigation);
  }
  
  closeModal(){
    this.props.navigation.dispatch(NavigationActions.back())
  }
  
  render(){
    return (
      <View style={{flex:1,backgroundColor:Colors.pinkly}}>
        <View style={{flex:1}}>
          <View style={{...Views.bottomCenter,paddingTop:getDimensions().height*.2,marginBottom:20}}>
            <FontMatilde color={Colors.white} text={this.state.count} size={300} vspace={0}/>
            <FontPoiret 
              text={`${this.props.navigation.state.params.like.colorx.name}${this.state.count !== 1 ? 's' : ''}`} 
              size={34} color={Colors.white} vspace={0}/>
          </View>
          <View style={{...Views.rowSpaceAround}}>
            <View style={{...Views.middle}}>
              <TouchableOpacity onPress={() => this.setState({count:this.state.count-1})}>
                <Ionicons name="ios-remove" size={80} style={{color:Colors.blue}}/>
              </TouchableOpacity>
            </View>
            <View style={{...Views.middle}}>
              <TouchableOpacity onPress={() => this.setState({count:this.state.count+1})}>
                <Ionicons name="ios-add" size={80} style={{color:Colors.blue}}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{position:'absolute',bottom:0,height:80,justifyContent:'center'}}>
          <TouchableOpacity onPress={() => this.closeModal()}>
            <EvilIcons name="close" size={80} style={{color:Colors.blue,margin:0,marginLeft:6}}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
}

export default Claims