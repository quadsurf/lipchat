

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'

//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { err,Modals } from '../../utils/Helpers'

//GQL
import { GetLikesForShopper } from './../../api/db/queries'

//COMPONENTS
import { LikeCard } from './../Components'

class Likes extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    likes: []
  }
  
  componentWillMount(){
    // console.log('nav: ',this.props.nav);
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
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
  
  componentWillReceiveProps(newProps){
    if (
      newProps.getLikesForShopper && 
      newProps.getLikesForShopper.allLikes && 
      newProps.getLikesForShopper.allLikes.length > 0
    ) {
      if (newProps !== this.state.likes) {
        this.setState({likes:newProps.getLikesForShopper.allLikes})
      }
    }
  }
  
  renderNoLikes = () => (
    <View style={{...Views.middle}}>
      <FontPoiret text="No Like History Yet" size={Texts.large.fontSize}/>
    </View>
  )
  
  onPressClaim(like){
    // console.log('onPressClaim func called for: ',like)
    this.props.nav.navigate('Claims',{like})
  }
  
  renderLikes(){
    if (this.state.likes.length > 0) {
      return this.state.likes.map( like => {
        return <LikeCard 
          key={like.colorx.id} 
          like={like.colorx} 
          onPressClaim={() => this.onPressClaim(like)} 
          rgb={like.colorx.rgb ? `rgb(${like.colorx.rgb})` : Colors.purpleText}/>
      })
    } else {
      return this.renderNoLikes()
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingVertical:16}}>
        {this.renderLikes()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Likes" size={Texts.xlarge.fontSize}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

export default compose(
  graphql(GetLikesForShopper,{
    name: 'getLikesForShopper',
    options: props => ({
      variables: {
        shopperId: { id: props.user.shopperx.id }
      }
    })
  })
)(Likes)
// 10000048005
