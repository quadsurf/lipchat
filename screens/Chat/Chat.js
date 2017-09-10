

import React, { Component } from 'react'
import {
  Text,
  View
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetChatsForDistributor } from '../../api/db/queries'
// import {  } from '../../api/db/pubsub'


//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

class Chat extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    userType: this.props.user.type
  }

  shouldComponentUpdate(nextProps,nextState){
    console.log('nextProps',nextProps);
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
    return false
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

  renderMainContent(){
    return (
      <View style={{...Views.middle}}>
        <FontPoiret text="Chat" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
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

export default compose(
  graphql(GetChatsForDistributor,{
    name: 'getChatsForDistributor',
    options: props => ({
      variables: {
        DistributorId: {
          id: props.user && props.user.distributorx && props.user.distributorx.id ? props.user.distributorx.id : ''
        }
      }
    })
  })
)(Chat)
