

import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

//GQL
import { GetShoppersDistributor,CheckIfShopperHasDmChatWithDistributor } from '../../api/db/queries'

//LIBS
import { compose,graphql } from 'react-apollo'
import { Ionicons } from '@expo/vector-icons'
import { withNavigation } from 'react-navigation'
import axios from 'axios'
import { NavigationActions } from 'react-navigation'

//LOCALS
import MyStatusBar from '../../common/MyStatusBar'
import { Views,Colors } from '../../css/Styles'
import { FontMatilde,FontPoiret } from '../../assets/fonts/Fonts'
import { getDimensions } from '../../utils/Helpers'
import { AppName,method,url,newClaimText,newClaimText2 } from '../../config/Defaults'
import { Modals } from '../../utils/Helpers'

const { width,height } = getDimensions()

@withNavigation
class Claims extends Component {
  
  state = {
    count: 0,
    colorName: this.props.navigation.state.params.like.colorx.name,
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    isVerified: null
    // distributorId: ''
  }
  
  componentWillMount(){
    // console.log('Shoppers Distributor on Claims.js: ',this.props.navigation);
  }
  
  componentWillReceiveProps(newProps){
    if (
      newProps.getShoppersDistributor
       && newProps.getShoppersDistributor.Shopper
       && newProps.getShoppersDistributor.Shopper.distributorsx
    ) {
      let { status,id } = newProps.getShoppersDistributor.Shopper.distributorsx[0]
      let { shopperId,sadvrId } = this.props.navigation.state.params
      if (newProps.getShoppersDistributor.Shopper.distributorsx.length > 0) {
        // DIST EXISTS
        console.log('DIST EXISTS');
        if (status !== false) {
          // DIST IS VERIFIED
          console.log('IS VERIFIED');
          this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,id,true)
        } else {
          // DIST IS NOT VERIFIED
          console.log('IS NOT VERIFIED');
          this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,sadvrId,false)
        }
      } else {
        // DIST DOES NOT EXIST
        console.log('DIST DOES NOT EXIST');
        this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,sadvrId,false)
      }
    }
  }
  
//NEEDS ERROR HANDLING
  checkIfShopperHasDmChatWithDistributorInDb(shopperId,distributorId,withDist){
    console.log('checkIfShopperHasDmChatWithDistributorInDb func called');
    if (shopperId && distributorId) {
      let headers = { Authorization: `Bearer ${this.props.navigation.state.params.gcToken}` }
      axios({
        headers,method,url,
        data: {
          query: CheckIfShopperHasDmChatWithDistributor,
          variables: {
            shoppersx: { id:shopperId },
            distributorsx: { id:distributorId },
            type: withDist ? 'DMSH2DIST' : 'DMU2ADMIN'
          }
        }
      }).then( res => {
        if (res && res.data && res.data.data && res.data.data.allChats) {
          let who = withDist ? 'distributor' : 'admin'
          console.log('successfully retrieved shoppers DM chat with',who);
          if (res.data.data.allChats.length > 0) {
            let dist = res.data.data.allChats[0]
            let { id } = dist
            let { bizName } = dist.distributorsx[0]
            let { fbkFirstName,fbkLastName } = dist.distributorsx[0].userx
            this.saveNewClaimMessage(id,bizName,fbkFirstName,fbkLastName)
          }
        } else {
          console.log('response data not recd for CheckIfShopperHasDmChatWithDistributor query request');
        }
      }).catch( e => {
        console.log('failed to check if shopper has DM chat with Distributor',e.message);
      })
    } else {
      console.log('insufficient inputs to run CheckIfShopperHasDmChatWithDistributor query');
    }
    this.setState({isVerified:withDist})
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
  
  saveNewClaimMessage(chatId,bizName,fbkFirstName,fbkLastName){
    this.setState({
      newClaimMessage: {
        chatId,
        writer: this.props.navigation.state.params.userId,
        audience: 'ANY'
      },
      bizName,fbkFirstName,fbkLastName
    })
  }
  
  closeModal(){
    this.props.navigation.dispatch(NavigationActions.back())
  }
  
  sendClaim(){
    let { newClaimMessage } = this.state
    let claim = {
      ...newClaimMessage,
      text: `${newClaimText} ${this.state.count} ${this.state.colorName}${this.state.count !== 1 ? 's.' : '.'} ${newClaimText2}`
    }
    console.log('sendClaim func called with',claim);
  }
  
  prepareClaim(){
    let { bizName,fbkFirstName,fbkLastName,isVerified,count,colorName } = this.state
    let distName = bizName ? bizName : `${fbkFirstName} ${fbkLastName}`
    this.showModal('prompt','Confirm Desire',`${AppName} will notify ${isVerified ? distName : 'your distributor'} of your desire to reserve/claim from their inventory the following:${"\n"}${"\n"}Color: ${colorName}${"\n"}Quantity: ${count}${"\n"}${"\n"}If you are also needing other beauty products such as gloss, please send her a private chat.`)
    this.sendClaim()
  }
  
  renderRequestButton(){
    if (this.state.count > 0) {
      return (
        <TouchableOpacity 
          style={{...Views.middle,backgroundColor:Colors.purple}}
          onPress={() => this.prepareClaim()}>
            <FontPoiret 
              text="next" 
              size={34} 
              color={Colors.blue} 
              vspace={0}/>
        </TouchableOpacity>
      )
    } else {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.purpleText}}>
            <FontPoiret 
              text="next" 
              size={34} 
              color={Colors.transparentWhite} 
              vspace={0}/>
        </View>
      )
    }
  }
  
  updateCount(op){
    let { count } = this.state
    if (op === '+') {
      this.setState({count:count+1})
    }
    if (op === '-' && count > 0) {
      this.setState({count:count-1})
    }
  }
  
  renderMainContent(){
    return (
      <View style={{flex:1}}>
        <View style={{flex:1}}>
          <View style={{...Views.bottomCenter,paddingTop:height*.2,marginBottom:20}}>
            <FontMatilde color={Colors.white} text={this.state.count} size={300} vspace={0}/>
            <FontPoiret 
              text={`${this.state.colorName}${this.state.count !== 1 ? 's' : ''}`} 
              size={34} color={Colors.white} vspace={0}/>
          </View>
          <View style={{...Views.rowSpaceAround}}>
            <View style={{...Views.middle}}>
              <TouchableOpacity onPress={() => this.updateCount('-')}>
                <Ionicons name="ios-remove" size={80} style={{color:Colors.blue}}/>
              </TouchableOpacity>
            </View>
            <View style={{...Views.middle}}>
              <TouchableOpacity onPress={() => this.updateCount('+')}>
                <Ionicons name="ios-add" size={80} style={{color:Colors.blue}}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{position:'absolute',bottom:0,height:80,justifyContent:'center'}}>
          <View style={{width,height:80,flexDirection:'row'}}>
            {this.renderRequestButton()}
            <View style={{width:1,height:80,backgroundColor:Colors.pinkly}}/>
            <TouchableOpacity 
              style={{...Views.middle,backgroundColor:Colors.purple}}
              onPress={() => this.closeModal()}>
                <FontPoiret 
                  text="cancel" 
                  size={34} 
                  color={Colors.blue} 
                  vspace={0}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
  
  render(){
    return(
      <View style={{flex:1,backgroundColor:Colors.pinkly}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }
  
}

export default compose(
  graphql(GetShoppersDistributor,{
    name: 'getShoppersDistributor',
    options: props => ({
      variables: {
        shopperId: props.navigation.state.params.shopperId
      },
      fetchPolicy: 'network-only'
    })
  })
)(Claims)