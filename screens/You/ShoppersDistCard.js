

import React, {Component} from 'react'
import {
  View,Image,Text
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { FindDistributor } from '../../api/db/queries'
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

class ShoppersDistCard extends Component {

  state = {
    ShoppersDist: null
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      console.log(newProps);
      if (
        newProps.findDistributor
        && newProps.findDistributor.allDistributors
        && newProps.findDistributor.allDistributors.length > 0
      ) {
        if (newProps.findDistributor.allDistributors[0] !== this.state.ShoppersDist ) {
          this.setState({ShoppersDist:newProps.findDistributor.allDistributors[0]},()=>{
            this.linkShopperToDistributorInDb()
          })
        }
      }
    }
  }

  checkIfLinkExists(){
    if (true) {
      // delink and link
    } else {
      // link
    }
  }

  linkShopperToDistributorInDb(){
    if (
      this.state.ShoppersDist
      && this.state.ShoppersDist.id
      && this.props.shopperId
    ) {
      this.props.linkShopperToDistributor({
        variables: {
          ShopperId: this.props.shopperId,
          DistributorId: this.state.ShoppersDist.id
        }
      })
    } else {
      console.log('not enuf inputs for gql request');
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
  graphql(FindDistributor,{
    name: 'findDistributor',
    options: props => ({
      variables: {
        DistributorDistId: props.distId
      }
    })
  }),
  graphql(LinkShopperToDistributor,{
    name: 'linkShopperToDistributor'
  }),
  graphql(DeLinkShopperFromDistributor,{
    name: 'deLinkShopperFromDistributor'
  })
)(ShoppersDistCard)
