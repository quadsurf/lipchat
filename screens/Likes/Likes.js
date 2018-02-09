

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'

//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { err,Modals } from '../../utils/Helpers'

//GQL
import { GetLikesForShopper } from './../../api/db/queries'
import { SubToLikesForShopper } from './../../api/db/pubsub'

//COMPS
import LikeCard from './LikeCard'

class Likes extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    likes: null
  }
  
  subToLikesInDb(){
    this.props.getLikesForShopper.subscribeToMore({
      document: SubToLikesForShopper,
      variables: {
        shopperId: { id: this.props.user.shopperx.id }
      },
      updateQuery: (previous,{ subscriptionData }) => {
        const { node: { colorx:like,doesLike },mutation,previousValues } = subscriptionData.data.Like
        const { node } = subscriptionData.data.Like
        if (mutation === 'CREATED') {
          this.addLikeToLikesList(node,this.state.likes)
        }
        if (mutation === 'UPDATED') {
          if (!doesLike) {
            this.removeLikeFromLikesList(like.id)
          } else {
            this.addLikeToLikesList(node,this.state.likes)
          }
        }
      }
    })
  }
  
  removeLikeFromLikesList(likeId){
    let likes = this.state.likes.filter( ({ colorx: { id } }) => {
      return likeId !== id
    })
    this.setState({likes})
  }
  
  addLikeToLikesList(like,likes){
    let hasLike = likes.findIndex( ({ id }) => {
      return id === like.id
    })
    if (hasLike === -1) {
      this.setState({
        likes: [
          like,
          ...likes
        ]
      })
    }
  }
  
  componentDidMount(){
    this.subToLikesInDb()
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
  
  componentWillReceiveProps(newProps){
    if (
      newProps.getLikesForShopper && 
      newProps.getLikesForShopper.allLikes
    ) {
      if (newProps.getLikesForShopper.allLikes !== this.state.likes) {
        this.setState({likes:newProps.getLikesForShopper.allLikes})
      }
    }
  }

  renderNoLikes = () => {
    let { likes } = this.state
    if (likes === null) {
      return (
        <View style={{...Views.middle,marginTop:200}}>
          <DotsLoader
            size={15}
            color={Colors.pinkly}
            frequency={5000}/>
        </View>
      )
    } else {
      return (
        <View style={{...Views.middle,marginTop:200}}>
          <FontPoiret text="No Like History Yet" size={Texts.large.fontSize}/>
          <FontPoiret text="Colors You Favorite Will Appear Here" size={Texts.medium.fontSize} vspace={12}/>
        </View>
      )
    }
  }

  renderDistScreen = () => (
    <View style={{...Views.middle,marginTop:20}}>
      <FontPoiret text="This Screen is meant for your" size={Texts.large.fontSize}/>
      <FontPoiret text="Shoppers to help them reserve" size={Texts.large.fontSize}/>
      <FontPoiret text="Colors from your Inventory" size={Texts.large.fontSize}/>
      <MaterialCommunityIcons 
        name="ray-start-end" 
        size={30} 
        color={Colors.transparentWhite} 
        style={{marginVertical:24}}/>
      <FontPoiret text="In order to keep you in" size={Texts.large.fontSize}/>
      <FontPoiret text="compliance, this is not a" size={Texts.large.fontSize}/>
      <FontPoiret text="shopping cart ordering system," size={Texts.large.fontSize}/>
      <FontPoiret text="but rather, a way for them to" size={Texts.large.fontSize}/>
      <FontPoiret text="reserve and deduct colors" size={Texts.large.fontSize}/>
      <FontPoiret text="from your inventory and" size={Texts.large.fontSize}/>
      <FontPoiret text="improve communication." size={Texts.large.fontSize}/>
    </View>
  )
  
  onPressClaim(like){
    this.props.nav.navigate('Claims',{
      like,
      shopperId:this.props.user.shopperx.id,
      gcToken:this.props.localStorage.gcToken,
      userId: this.props.user.id,
      sadvrId: this.props.sadvrId
    })
  }
  
  renderLikes(){
    if (this.props.userType === 'DIST') {
      return this.renderDistScreen()
    } else {
      let { likes } = this.state
      if (likes && likes.length > 0) {
        return likes.map( ({ colorx:like,id }) => {
          return <LikeCard 
            key={id} 
            like={like} 
            onPressClaim={() => this.onPressClaim(like)} 
            rgb={like.rgb ? `rgb(${like.rgb})` : Colors.purpleText}/>
        })
      } else {
        return this.renderNoLikes()
      }
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
        <FontPoiret text="Faves" size={Texts.xlarge.fontSize}/>
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
