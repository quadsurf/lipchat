

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
import { LinkShopperToDistributor,DeLinkShopperFromDistributor } from '../../api/db/mutations'

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
    console.log('sendRequests func called');
    axios.all([this.getDistributor(),this.findDistributor()])
      .then(axios.spread( (currentDist,newDist) => {
        console.log('currentDistributor',currentDist.data.data.Shopper.distributorsx)
        console.log('newDistributor',newDist.data.data.allDistributors)
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
    console.log('newProps received');
    if (newProps) {
      console.log('newProps received');
      if (newProps.distId) {
        console.log('distId',newProps.distId)
        if (newProps.distId !== this.state.distId) {
          console.log('the new distId is different')
          this.setState({distId:newProps.distId},()=>{
            this.sendRequests()
          })
        } else {
          console.log('the new distId is NOT different')
        }
      }
      // if (
      //   newProps.findDistributor && newProps.findDistributor.allDistributors
      //   && newProps.findFormerDistributor && newProps.findFormerDistributor.allDistributors
      // ) {
      //   if (
      //     newProps.findDistributor.allDistributors
      //     !== newProps.findFormerDistributor.allDistributors
      //   ) {
      //     this.deLinkShopperFromDistributorInDb(newProps.findDistributor.allDistributors[0],newProps.findFormerDistributor.allDistributors[0])
      //   } else {
      //     this.linkShopperToDistributorInDb(newProps.findDistributor.allDistributors[0])
      //   }
      //   if (newProps.findDistributor.allDistributors.length > 0) {
      //     if (newProps.findDistributor.allDistributors[0] !== this.state.ShoppersDist ) {
      //       this.deLinkShopperFromDistributorInDb(newProps.findDistributor.allDistributors[0])
      //     }
      //   } else {
      //     this.linkShopperToDistributorInDb(newProps.findDistributor.allDistributors[0])
      //   }
      // }
    }
  }

  linkShopperToDistributorInDb(ShoppersDist){
    console.log('link func called');
    if (this.props.shopperId) {
      this.props.linkShopperToDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: ShoppersDist.id
        }
      }).then( res => {
        if (res && res.data && res.data.addToShopperOnDistributor) {
            console.log('link func success');
            this.setState({ShoppersDist})
        } else {
          console.log('1. no regular response from link request');
        }
      }).catch( e => {
        console.log('2. link func error',e.message);
      })
    } else {
      console.log('3. not enuf valid inputs for gql link request');
      console.log(ShoppersDist.id,this.props.shopperId);
    }
  }

  deLinkShopperFromDistributorInDb(ShoppersDist,formerShoppersDist,bool){
    console.log('delink func called');
    if (this.props.shopperId) {
      this.props.deLinkShopperFromDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: formerShoppersDist.id
        }
      }).then( res => {
        if (res && res.data && res.data.removeFromShopperOnDistributor) {
          console.log('delink func success');
          if (bool) {
            this.linkShopperToDistributorInDb(ShoppersDist)
          } else {
            this.setState({ShoppersDist:null})
          }
        } else {
          console.log('1. no regular response from delete request');
        }
      }).catch( e => {
        console.log('2. delink func error',e.message);
      })
    } else {
      console.log('3. not enuf valid inputs for gql delink request');
      console.log(ShoppersDist,formerShoppersDist);
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
            <FontPoiret text="distributor does not exist" size={medium} color={Colors.white}/>
          </View>
        </View>
      )
    } else {
      let { bizName,bizUri,logoUri,status } = this.state.ShoppersDist
      let { fbkUserId,cellPhone,fbkFirstName,fbkLastName } = this.state.ShoppersDist.userx
      let uri = logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
      let name = `by ${fbkFirstName || ''} ${fbkLastName || ''}`
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
    }
  }

}

export default compose(
  // graphql(FindDistributor,{
  //   name: 'findDistributor',
  //   options: props => ({
  //     variables: {
  //       DistributorDistId: props.distId
  //     },
  //     fetchPolicy: 'network-only'
  //   })
  // }),
  // graphql(FindDistributor,{
  //   name: 'findFormerDistributor',
  //   options: props => ({
  //     variables: {
  //       DistributorDistId: props.formerDistId
  //     },
  //     fetchPolicy: 'network-only'
  //   })
  // }),
  graphql(LinkShopperToDistributor,{
    name: 'linkShopperToDistributor'
  }),
  graphql(DeLinkShopperFromDistributor,{
    name: 'deLinkShopperFromDistributor'
  })
)(ShoppersDistCard)
