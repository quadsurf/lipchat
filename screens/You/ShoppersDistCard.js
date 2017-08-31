

import React, {Component} from 'react'
import {
  View,Image,Text
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'

// GQL
import { FindDistributor } from '../../api/db/queries'

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
      if (newProps.findDistributor && newProps.findDistributor.allDistributors) {
        if (newProps.findDistributor.allDistributors[0] !== this.state.ShoppersDist ) {
          this.setState({ShoppersDist:newProps.findDistributor.allDistributors[0]})
        }
      } else {
        console.log('props not properly received');
      }
    }
  }

  render(){
    let size = 90
    let width = screen.width*.8
    let cardLeft = {width:size,height:size}
    let cardRight = {height:size,paddingHorizontal:10,paddingVertical:5}
    let imgSize = {...cardLeft,borderRadius:12}
    let cardStyle = {width,flexDirection:'row',backgroundColor:Colors.pinkly,borderRadius:12}
    if (!this.state.ShoppersDist) {
      return (
        <View style={{flex:1}}><Text>loading...</Text></View>
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
  })
)(ShoppersDistCard)
