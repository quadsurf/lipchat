

import React, { Component } from 'react'
import {
  Text,
  View
} from 'react-native'

//LIBS


//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals } from '../utils/Helpers'

class LipColors extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user
  }

  shouldComponentUpdate(nextProps,nextState){
    // if (this.props !== nextProps) {
    //   return true
    // }
    // if (this.state !== nextState) {
    //   return true
    // }
    return false
  }

  // if modalType='error', then pass at least the first 3 params below
  // if modalType='processing', then pass only modalType
  // if modalType='prompt', then pass TBD
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

  renderMainContent(){
    return (
      <View style={{...Views.middle}}>
        <FontPoiret text="Lip Colors" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

export default LipColors

// static navigationOptions = ({navigation}) => ({
//   header: null
// })

// navigate: this.props.navigation.navigate

// this.state.navigate('Intros')
