

//ERROR HANDLING NEEDED

import React, {Component} from 'react'
import {
  View,Image,Text
} from 'react-native'

//LIBS
import axios from 'axios'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import {
  FindDistributor,CheckForDistributorOnShopper,CheckIfShopperHasDmChatWithDistributor
} from '../../api/db/queries'
import {
  LinkShopperToDistributor,DeLinkShopperFromDistributor,TriggerEventOnChat,
  AddShopperToDistributorsGroupChat,RemoveShopperFromDistributorsGroupChat,
  CreateDmChatForShopperAndDistributor
} from '../../api/db/mutations'

// LOCALS
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Colors,Texts } from '../../css/Styles'
import { getDimensions } from '../../utils/Helpers'
import { clipText,shortenUrl } from '../../utils/Helpers'
import { method,url } from '../../config/Defaults'

// CONSTs
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const screen = getDimensions()
const debugging = __DEV__ && false

class ShoppersDistCard extends Component {

  state = {
    ShoppersDist: null,
    headers: { Authorization: `Bearer ${this.props.gcToken}` },
    distId: ''
  }

  getDistributor(){
    let { headers } = this.state
    return axios({
      headers,method,url,
      data: {
        query: CheckForDistributorOnShopper,
        variables: {
          ShopperId: this.props.shopperId
        }
      }
    })
  }

  findDistributor(){
    let { headers } = this.state
    return axios({
      headers,method,url,
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
            if (debugging) console.log('current and new distributor exists, so deLink and link with new')
            this.deLinkShopperFromDistributorInDb(nextDist[0],prevDist[0],true)
          } else {
            if (debugging) console.log('there is a new distributor but no current distributor, so add-only')
            this.linkShopperToDistributorInDb(nextDist[0])
          }
        } else {
          if (debugging) console.log('new distributor does not exist');
          if (prevDistExists) {
            if (debugging) console.log('current distributor exists and needs to be removed')
            this.deLinkShopperFromDistributorInDb(false,prevDist[0],false)
          }
        }
      }))
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
    if (debugging) console.log('linkShopperToDistributorInDb func called with:',nextDist.distId)
    if (this.props.shopperId && nextDist.id) {
      this.props.linkShopperToDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: nextDist.id
        }
      }).then( res => {
        if (debugging) console.log('successfully linked Shopper to NEXT Distributor');
        if (res && res.data && res.data.addToShopperOnDistributor) {
            this.setState({ShoppersDist:nextDist},()=>{
              this.checkIfShopperHasDmChatWithDistributorInDb(this.props.shopperId,nextDist.id)
              if (nextDist.chatsx.length > 0) {
                this.addShopperToDistributorsGroupChatInDb(nextDist.chatsx[0].id,this.props.shopperId)
              }
            })
        } else {
          if (debugging) console.log('1. no regular response from link request');
        }
      }).catch( e => {
        if (debugging) console.log('failed to link Shopper to NEXT Distributor',e.message)
      })
    } else {
      if (debugging) console.log('not enuf valid inputs for gql linkShopperToDistributor method');
    }
  }

  deLinkShopperFromDistributorInDb(nextDist,prevDist,replaceWithNew){
    if (debugging) console.log('deLinkShopperFromDistributorInDb func called');
    if (debugging) console.log('replace with New Dist? ',replaceWithNew);
    if (this.props.shopperId && prevDist.id) {
      this.props.deLinkShopperFromDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: prevDist.id
        }
      }).then( () => {
        if (debugging) console.log('successfully delinked Shopper from Distributor');
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
        if (debugging) console.log('failed to delink Shopper from Distributor',e.message);
      })
    } else {
      if (debugging) console.log('not enuf valid inputs for gql deLinkShopperFromDistributor method');
    }
  }

  addShopperToDistributorsGroupChatInDb(chatsxChatId,shoppersxShopperId){
    if (debugging) console.log('addShopperToDistributorsGroupChatInDb func called');
    if (this.props.shopperId && chatsxChatId) {
      this.props.addShopperToDistributorsGroupChat({
        variables: {
          chatsxChatId,shoppersxShopperId
        }
      }).then( () => {
        if (debugging) console.log('successfully added Shopper To Distributors Group Chat In Db');
        this.triggerEventOnChatInDb(chatsxChatId)
      }).catch( e => {
        if (debugging) console.log('failed to add Shopper To Distributors Group Chat In Db',e.message);
      })
    }
  }
  
  removeShopperFromDistributorsGroupChatInDb(shopperId,chatId){
    if (debugging) console.log('removeShopperFromDistributorsGroupChatInDb func called');
    if (shopperId && chatId) {
      this.props.removeShopperFromDistributorsGroupChat({
        variables: {
          shopperId,chatId
        }
      }).then( () => {
        if (debugging) console.log('successfully removed Shopper from Distributors Group Chat in DB');
        this.triggerEventOnChatInDb(chatId)
      }).catch( e => {
        if (debugging) console.log('failed to remove Shopper from Distributors Group Chat in DB',e.message);
      })
    }
  }

  checkIfShopperHasDmChatWithDistributorInDb(shoppersx,distributorsx){
    if (debugging) console.log('checkIfShopperHasDmChatWithDistributorInDb func called');
    if (shoppersx && distributorsx) {
      let { headers } = this.state
      axios({
        headers,method,url,
        data: {
          query: CheckIfShopperHasDmChatWithDistributor,
          variables: {
            shoppersx: { id:shoppersx },
            distributorsx: { id:distributorsx },
            type: 'DMSH2DIST'
          }
        }
      }).then( res => {
        if (res && res.data && res.data.data && res.data.data.allChats) {
          if (debugging) console.log('successfully checked if shopper has DM chat with Distributor');
          if (res.data.data.allChats.length < 1) {
            if (debugging) console.log('shopper does not have DM chat with Distributor, call create func');
            this.createDmChatForShopperAndDistributorInDb(distributorsx,shoppersx)
          } else {
            if (debugging) console.log('shopper has DM chat with Distributor, no need to create');
          }
        } else {
          if (debugging) console.log('response data not recd for CheckIfShopperHasDmChatWithDistributor query request');
        }
      }).catch( e => {
        if (debugging) console.log('failed to check if shopper has DM chat with Distributor',e.message);
      })
    } else {
      if (debugging) console.log('insufficient inputs to run CheckIfShopperHasDmChatWithDistributor query');
    }
  }

  createDmChatForShopperAndDistributorInDb(distributorsx,shoppersx){
    if (debugging) console.log('createDmChatForShopperAndDistributorInDb func called');
    if (distributorsx && shoppersx) {
      let { headers } = this.state
      axios({
        headers,method,url,
        data: {
          query: CreateDmChatForShopperAndDistributor,
          variables: { distributorsx,shoppersx }
        }
      }).then( res => {
        if (res && res.data && res.data.data && res.data.data.createChat) {
          if (debugging) console.log('successfully created dm chat for shopper and distributor');
        } else {
          if (debugging) console.log('no response received for CreateDmChatForShopperAndDistributor request');
        }
      }).catch( e => {
        if (debugging) console.log('failed to create dm chat for shopper and distributor',e.message);
      })
    } else {
      if (debugging) console.log('insufficient inputs to run createDmChatForShopperAndDistributorInDb mutation');
    }
  }
  
  triggerEventOnChatInDb(chatId){
    this.props.triggerEventOnChat({
      variables: {
        chatId,
        updater: JSON.stringify(new Date())
      }
    }).then( res => {
      if (debugging) console.log('event successfully triggered on chat node');
    }).catch( e => {
      if (debugging) console.log('could not trigger event on Chat node',e.message);
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
              <FontPoiret text="distributor exists but" size={medium} color={Colors.white}/>
              <FontPoiret text="hasn't been verified yet" size={medium} color={Colors.white}/>
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
