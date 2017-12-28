

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
  LinkShopperToDistributor,DeLinkShopperFromDistributor,TriggerEventOnChat,
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
        let prevDist = currentDist.data.data.Shopper.distributorsx
        let nextDist = newDist.data.data.allDistributors
        let prevDistExists = prevDist.length > 0 ? true : false
        let nextDistExists = nextDist.length > 0 ? true : false
        if (nextDistExists) {
          if (prevDistExists) {
            console.log('current and new distributor exists, so deLink and link with new')
            this.deLinkShopperFromDistributorInDb(nextDist[0],prevDist[0],true)
          } else {
            console.log('there is a new distributor but no current distributor, so add-only')
            this.linkShopperToDistributorInDb(nextDist[0])
          }
        } else {
          console.log('new distributor does not exist');
          if (prevDistExists) {
            console.log('current distributor exists and needs to be removed')
            this.deLinkShopperFromDistributorInDb(false,prevDist[0],false)
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

  linkShopperToDistributorInDb(nextDist){
    console.log('linkShopperToDistributorInDb func called with:',nextDist.distId)
    if (this.props.shopperId && nextDist.id) {
      this.props.linkShopperToDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: nextDist.id
        }
      }).then( res => {
        console.log('successfully linked Shopper to NEXT Distributor');
        if (res && res.data && res.data.addToShopperOnDistributor) {
            this.setState({ShoppersDist:nextDist},()=>{
              if (nextDist.chatsx.length > 0) {
                this.addShopperToDistributorsGroupChatInDb(nextDist.chatsx[0].id,this.props.shopperId)
              }
            })
        } else {
          console.log('1. no regular response from link request');
        }
      }).catch( e => {
        console.log('failed to link Shopper to NEXT Distributor',e.message)
      })
    } else {
      console.log('not enuf valid inputs for gql linkShopperToDistributor method');
    }
  }

  deLinkShopperFromDistributorInDb(nextDist,prevDist,replaceWithNew){
    console.log('deLinkShopperFromDistributorInDb func called');
    console.log('replace with New Dist? ',replaceWithNew);
    if (this.props.shopperId && prevDist.id) {
      this.props.deLinkShopperFromDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: prevDist.id
        }
      }).then( () => {
        console.log('successfully delinked Shopper from Distributor');
        if (prevDist.chatsx.length > 0) {
          this.removeShopperFromDistributorsGroupChatInDb(
            this.props.shopperId,prevDist.chatsx[0].id
          )
        }
        if (replaceWithNew) {
          this.linkShopperToDistributorInDb(nextDist)
        } else {
          this.setState({ShoppersDist:null})
        }
      }).catch( e => {
        console.log('failed to delink Shopper from Distributor',e.message);
      })
    } else {
      console.log('not enuf valid inputs for gql deLinkShopperFromDistributor method');
    }
  }

  addShopperToDistributorsGroupChatInDb(chatsxChatId,shoppersxShopperId){
    console.log('addShopperToDistributorsGroupChatInDb func called');
    if (this.props.shopperId && chatsxChatId) {
      this.props.addShopperToDistributorsGroupChat({
        variables: {
          chatsxChatId,shoppersxShopperId
        }
      }).then( () => {
        console.log('successfully added Shopper To Distributors Group Chat In Db');
        this.triggerEventOnChatInDb(chatsxChatId)
      }).catch( e => {
        console.log('failed to add Shopper To Distributors Group Chat In Db',e.message);
      })
    }
  }
  
  removeShopperFromDistributorsGroupChatInDb(shopperId,chatId){
    console.log('removeShopperFromDistributorsGroupChatInDb func called');
    if (shopperId && chatId) {
      this.props.removeShopperFromDistributorsGroupChat({
        variables: {
          shopperId,chatId
        }
      }).then( () => {
        console.log('successfully removed Shopper from Distributors Group Chat in DB');
        this.triggerEventOnChatInDb(chatId)
      }).catch( e => {
        console.log('failed to remove Shopper from Distributors Group Chat in DB',e.message);
      })
    }
  }
  
  triggerEventOnChatInDb(chatId){
    this.props.triggerEventOnChat({
      variables: {
        chatId,
        updater: JSON.stringify(new Date())
      }
    }).then( res => {
      console.log('event successfully triggered on chat node');
    }).catch( e => {
      console.log('could not trigger event on Chat node',e.message);
    })
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
  }),
  graphql(TriggerEventOnChat,{
    name: 'triggerEventOnChat'
  })
)(ShoppersDistCard)
