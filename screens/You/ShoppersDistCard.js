

import React, {Component} from 'react'
import {
  View,Image,Text
} from 'react-native'

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

//LIBS
import axios from 'axios'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { FindDistributor,CheckForDistributorOnShopper } from '../../api/db/queries'
import {
  LinkShopperToDistributor,DeLinkShopperFromDistributor,
  AddShopperToDistributorsGroupChat,RemoveShopperFromDistributorsGroupChat
} from '../../api/db/mutations'

// LOCALS
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'
import { clipText,shortenUrl } from '../../utils/Helpers'

// CONSTs
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const screen = getDimensions()
const method = 'post'
const url = `https://api.graph.cool/simple/v1/${PROJECT_ID}`

class ShoppersDistCard extends Component {

  state = {
    ShoppersDist: null,
    Authorization: `Bearer ${this.props.gcToken}`,
    distId: ''
  }

  getDistributor(){
    let { Authorization } = this.state
    return axios({
      headers: {Authorization},method,url,
      data: {
        query: CheckForDistributorOnShopper,
        variables: {
          ShopperId: this.props.shopperId
        }
      }
    })
  }

  findDistributor(){
    let { Authorization } = this.state
    return axios({
      headers: {Authorization},method,url,
      data: {
        query: FindDistributor,
        variables: {
          DistributorDistId: this.state.distId
        }
      }
    })
  }

  sendRequests(){
    axios.all([this.getDistributor(),this.findDistributor()])
      .then(axios.spread( (currentDist,newDist) => {
        let currentDistributor = currentDist.data.data.Shopper.distributorsx
        let newDistributor = newDist.data.data.allDistributors
        let currentDistributorExists = currentDistributor.length > 0 ? true : false
        let newDistributorExists = newDistributor.length > 0 ? true : false
        if (newDistributorExists) {
          if (currentDistributorExists) {
            this.deLinkShopperFromDistributorInDb(newDistributor[0],currentDistributor[0],true)
          } else {
            this.linkShopperToDistributorInDb(newDistributor[0])
          }
        } else {
          if (currentDistributorExists) {
            this.deLinkShopperFromDistributorInDb(false,currentDistributor[0],false)
          }
        }
      }))
  }

  componentWillMount(){
    // this.sendRequests()
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      if (newProps.distId) {
        if (newProps.distId !== this.state.distId) {
          this.setState({distId:newProps.distId},()=>{
            this.sendRequests()
          })
        }
      }
    }
  }

  linkShopperToDistributorInDb(ShoppersDist){
    if (this.props.shopperId) {
      this.props.linkShopperToDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: ShoppersDist.id
        }
      }).then( res => {
        if (res && res.data && res.data.addToShopperOnDistributor) {
            this.setState({ShoppersDist},()=>{
              this.addShopperToDistributorsGroupChatInDb(ShoppersDist.chatsx[0].id,this.props.shopperId)
            })
        } else {
          console.log('1. no regular response from link request');
        }
      }).catch( e => {
        console.log('2. link func error',e.message);
      })
    } else {
      console.log('3. not enuf valid inputs for gql link request');
    }
  }

  deLinkShopperFromDistributorInDb(ShoppersDist,formerShoppersDist,replaceWithNew){
    if (this.props.shopperId) {
      this.props.deLinkShopperFromDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: formerShoppersDist.id
        }
      }).then( res => {
        if (res && res.data && res.data.removeFromShopperOnDistributor) {
          this.removeShopperFromDistributorsGroupChatInDb(
            this.props.shopperId,formerShoppersDist.chatsx[0].id,
            ShoppersDist,replaceWithNew
          )
        } else {
          console.log('1. no regular response from delete request');
        }
      }).catch( e => {
        console.log('2. delink func error',e.message);
      })
    } else {
      console.log('3. not enuf valid inputs for gql delink request');
    }
  }

  addShopperToDistributorsGroupChatInDb(chatsxChatId,shoppersxShopperId){
    if (this.props.shopperId && chatsxChatId) {
      this.props.addShopperToDistributorsGroupChat({
        variables: {
          chatsxChatId,shoppersxShopperId
        }
      })
    }
  }
  
  removeShopperFromDistributorsGroupChatInDb(shopperId,chatId,ShoppersDist,replaceWithNew){
    if (shopperId && chatId) {
      this.props.removeShopperFromDistributorsGroupChat({
        variables: {
          shopperId,chatId
        }
      }).then( res => {
        if (replaceWithNew) {
          this.linkShopperToDistributorInDb(ShoppersDist)
        } else {
          this.setState({ShoppersDist:null})
        }
      }).catch( e => {
        console.log('There was a problem removing Shopper from Distributors Group Chat',e.message);
      })
    }
  }

  render(){
    let size = 90
    let width = screen.width*.8
    let cardLeft = {width:size,height:size}
    let cardRight = {height:size,paddingHorizontal:10,paddingVertical:5}
    let noExist = {
      height:size,justifyContent:'center',alignItems:'center',paddingLeft:10
    }
    let imgSize = {...cardLeft,borderRadius:12}
    let cardStyle = {width,flexDirection:'row',backgroundColor:Colors.pinkly,borderRadius:12}
    if (!this.state.ShoppersDist) {
      return (
        <View style={cardStyle}>
          <View style={cardLeft}>
            <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
          </View>
          <View style={noExist}>
            <FontPoiret text="distributor not found" size={medium} color={Colors.white}/>
            <FontPoiret text="please try again" size={medium} color={Colors.white}/>
          </View>
        </View>
      )
    } else {
      let { bizName,bizUri,logoUri,status } = this.state.ShoppersDist
      let { fbkUserId,cellPhone,fbkFirstName,fbkLastName } = this.state.ShoppersDist.userx
      let uri = logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
      let name = `by ${fbkFirstName || ''} ${fbkLastName || ''}`
      if (status) {
        return (
          <View style={cardStyle}>
            <View style={cardLeft}>
              <Image source={{uri}} style={imgSize}/>
            </View>
            <View style={cardRight}>
              <FontPoiret text={clipText(bizName || '',17)} size={medium} color={Colors.white}/>
              <FontPoiret text={clipText(`${name}`,20)} size={small} color={Colors.white}/>
              <FontPoiret text={cellPhone} size={medium} color={Colors.white}/>
              <FontPoiret text={shortenUrl(bizUri,22)} size={small} color={Colors.white}/>
            </View>
          </View>
        )
      } else {
        return (
          <View style={cardStyle}>
            <View style={cardLeft}>
              <Image source={require('../../assets/images/avatar.png')} style={imgSize}/>
            </View>
            <View style={noExist}>
              <FontPoiret text="distributor exists, but" size={medium} color={Colors.white}/>
              <FontPoiret text="hasn't signed up yet" size={medium} color={Colors.white}/>
            </View>
          </View>
        )
      }
    }
  }

}

export default compose(
  graphql(LinkShopperToDistributor,{
    name: 'linkShopperToDistributor'
  }),
  graphql(DeLinkShopperFromDistributor,{
    name: 'deLinkShopperFromDistributor'
  }),
  graphql(AddShopperToDistributorsGroupChat,{
    name: 'addShopperToDistributorsGroupChat'
  }),
  graphql(RemoveShopperFromDistributorsGroupChat,{
    name: 'removeShopperFromDistributorsGroupChat'
  })
)(ShoppersDistCard)
