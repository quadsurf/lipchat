

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { DotsLoader } from 'react-native-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

//LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { err,Modals } from '../../utils/Helpers'

//GQL
import { GetLikesForShopper } from './../../api/db/queries'
import { SubToLikesForShopper } from './../../api/db/pubsub'

//COMPS
import LikeCard from './LikeCard'

class Likes extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      likes: null
    }
    this.onPressClaim = debounce(this.onPressClaim.bind(this),3000,true)
  }
  
  subToLikesInDb(){
    this.props.getLikesForShopper.subscribeToMore({
      document: SubToLikesForShopper,
      variables: {
        shopperId: { id:this.props.shopperId }
      },
      updateQuery: (previous,{ subscriptionData }) => {
        const { node: { id,doesLike },mutation,previousValues } = subscriptionData.data.Like
        const { node } = subscriptionData.data.Like
        if (mutation === 'CREATED') {
          this.addLikeToLikesList(node,this.state.likes)
        }
        if (mutation === 'UPDATED') {
          if (!doesLike) {
            this.removeLikeFromLikesList(id)
          } else {
            this.addLikeToLikesList(node,this.state.likes)
          }
        }
      }
    })
  }
  
  removeLikeFromLikesList(likeId){
    let likes = this.state.likes.filter( ({ id }) => {
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
    if (newProps !== this.props) {
      if (
        newProps.getLikesForShopper
        && newProps.getLikesForShopper.allLikes
        && this.state.likes === null
      ) {
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
    }
    if (likes.length === 0) {
      return (
        <View style={{...Views.middle,marginTop:200}}>
          <FontPoiret text="No Like History Yet" size={Texts.large.fontSize}/>
          <FontPoiret text="Colors You Favorite Will Appear Here" size={Texts.medium.fontSize} vspace={12}/>
        </View>
      )
    }
    return (
      <View style={{...Views.middle,marginTop:200}}>
        <FontPoiret text="Something's not right :-(" size={Texts.large.fontSize}/>
      </View>
    )
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
    this.props.nav.navigate('Claims',{like})
  }
  
  renderLikes(){
    let { likes } = this.state
    if (this.props.userType === 'DIST') {
      return this.renderDistScreen()
    } else {
      if (likes && likes.length > 0) {
        return likes.map( ({ colorx:like,id }) => {
          return <LikeCard 
            key={id} 
            like={like} 
            onPressClaim={this.onPressClaim} 
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
        <FontPoiret text="Faves" size={Texts.xlarge.fontSize}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }
  
  shouldComponentUpdate(nextProps,nextState){
    if (nextProps.userType !== this.props.userType) return true
    if (nextState.likes !== this.state.likes) return true
    return false
  }

}

Likes.propTypes = {
  shopperId: PropTypes.string.isRequired,
  userType: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  shopperId: state.shopper.id,
  userType: state.user.type
})

const LikesWithData = compose(
  graphql(GetLikesForShopper,{
    name: 'getLikesForShopper',
    options: props => ({
      // pollInterval: 20000,
      variables: {
        shopperId: { id: props.shopperId }
      }
    }),
    fetchPolicy: 'network-only'
  })
)(Likes)

export default connect(mapStateToProps)(LikesWithData)
// 10000048005
