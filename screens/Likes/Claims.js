

import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

import { withNavigation } from 'react-navigation'
import { NavigationActions } from 'react-navigation'

@withNavigation
class Claims extends Component {
  
  state = {
    
  }
  
  componentWillMount(){
    // console.log('nav on Claims.js: ',this.props.navigation);
  }
  
  closeModal(){
    this.props.navigation.dispatch(NavigationActions.back())
  }
  
  render(){
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <TouchableOpacity onPress={() => this.closeModal()}>
          <Text>
            Is this Modal Working?
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  
}

export default Claims