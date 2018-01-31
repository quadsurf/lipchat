

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetColorsAndInventories } from '../api/db/queries'
// import { SubUserType } from '../api/db/pubsub'
import { CreateLike,UpdateDoesLikeOnLike } from '../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { Modals,getDimensions } from '../utils/Helpers'

// CONSTS
const large = Texts.large.fontSize
const { width:screenWidth,height:screenHeight } = getDimensions()
const debugging = true

class Selfie extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: null,
    userType: this.props.userType
  }
// {id:likeId=null,doesLike=null}
  componentWillReceiveProps(newProps){
    if (newProps) {
      if (newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors) {
        if (newProps.getColorsAndInventories.allColors !== this.state.colors) {
          let newColors = newProps.getColorsAndInventories.allColors
          let colors = []
          newColors.forEach( ({
            id:colorId,family,finish,name,rgb,
            status,tone,
            likesx:[like={}]
          }) => {
            let { id:likeId=null,doesLike=null } = like
            colors.push({
              colorId,family,finish,name,
              rgb: `rgb(${rgb})`,
              status,tone,
              likeId,doesLike
            })
          })
          this.setState({colors},()=>{
            if (debugging) console.log('this.state.colors:',this.state.colors)
          })
        }
      }
    }
  }

  // componentDidMount(){
  //   this.subToUserType()
  // }
  // 
  // subToUserType(){
  //   this.props.getUserType.subscribeToMore({
  //     document: SubUserType,
  //     variables: {UserId:this.state.user.id},
  //     updateQuery: (previous, { subscriptionData }) => {}
  //   })
  // }

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

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Selfie',errText)
      },700)
    })
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.purple}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Manpreet, work your magic!!!" size={Texts.large.fontSize}/>
        {this.renderModal()}
      </View>
    )
  }

  checkIfLikeExistsInDb(LikeId,ColorId){
    let ShopperId = this.state.user.shopperx.id
    let bool = !this.state[`${ColorId}`].like.doesLike
    if (LikeId) {
      this.updateDoesLikeOnLikeInDb(LikeId,ColorId,bool)
    } else {
      this.createLikeInDb(ShopperId,ColorId)
    }
  }

  createLikeInDb(ShopperId,ColorId){
    let errText = 'creating a like for this color'
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: {ShopperId,ColorId}
      }).then( res => {
        if (res && res.data && res.data.createLike) {
          this.setState({
            [`${ColorId}`]: {
              ...this.state[`${ColorId}`],
              like: {
                id: res.data.createLike.id,
                doesLike: res.data.createLike.doesLike
              }
            }
          })
        } else {
            this.openError(`${errText} (error code: 1-${ShopperId}-${ColorId})`)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 2-${ShopperId}-${ColorId})`)
      })
    } else {
      this.openError(`${errText} (error code: 3-${ShopperId}-${ColorId})`)
    }
  }

  updateDoesLikeOnLikeInDb(LikeId,ColorId,bool){
    let errText = 'updating the like status for this color'
    if (LikeId && ColorId) {
      this.setState({
        [`${ColorId}`]: {
          ...this.state[`${ColorId}`],
          like: {
            id: LikeId,
            doesLike: bool
          }
        }
      },()=>{
        this.props.updateDoesLikeOnLike({
          variables: {LikeId,bool}
        }).then( res => {
          if (res && res.data && res.data.updateLike) {
            if (this.state[`${ColorId}`].like.doesLike !== res.data.updateLike.doesLike) {
              this.setState({
                [`${ColorId}`]: {
                  ...this.state[`${ColorId}`],
                  like: {
                    id: LikeId,
                    doesLike: !bool
                  }
                }
              },()=>{
                this.openError(`${errText}(1)`)
              })
            }
          } else {
            this.openError(`${errText}(2)`)
          }
        }).catch( e => {
          this.openError(`${errText}(3)`)
        })
      })
    } else {
      this.openError(`${errText}(4)`)
    }
  }

}

export default compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx ? props.user.distributorx.id : "",
        shopperxId: props.user.shopperx ? props.user.shopperx.id : ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  // graphql(GetUserType,{
  //   name: 'getUserType',
  //   options: props => ({
  //     variables: {
  //       UserId: props.user.id || ""
  //     },
  //     fetchPolicy: 'network-only'
  //   })
  // }),
  graphql(CreateLike,{
    name: 'createLike'
  }),
  graphql(UpdateDoesLikeOnLike,{
    name: 'updateDoesLikeOnLike'
  })
)(Selfie)