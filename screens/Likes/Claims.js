

// TESTS
// checkIfShopperHasDmChatWithDistributorInDb then remove // from Likes 171
// check if shopperId still works
// check if userId still works

import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

//GQL
import { GetShoppersDistributor,CheckIfShopperHasDmChatWithDistributor } from '../../api/db/queries'
import { CreateChatMessage,TriggerEventOnChat } from '../../api/db/mutations'

//LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-apollo'
import { Ionicons } from '@expo/vector-icons'
import { withNavigation } from 'react-navigation'
import axios from 'axios'
import { NavigationActions } from 'react-navigation'
import { debounce } from 'underscore'

//LOCALS
import { Views,Colors } from '../../css/Styles'
import { FontMatilde,FontPoiret } from '../../assets/fonts/Fonts'
import { getDimensions } from '../../utils/Helpers'
import { AppName,method,url,newClaimText,newClaimText2 } from '../../config/Defaults'
import { Modals } from '../../utils/Helpers'

//CONSTs
const debugging = __DEV__ && false
const { width,height } = getDimensions()

@withNavigation
class Claims extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      count: 0,
      colorName: this.props.navigation.state.params.like.name,
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      isVerified: null
    }
    this.openClaimConfirmation = debounce(this.openClaimConfirmation,3000,true)
    this.sendClaim = debounce(this.sendClaim,4000,true)
    this.closeModal = debounce(this.closeModal,3000,true)
    this.closeNavModal = debounce(this.closeNavModal,3000,true)
  }
  
  componentWillReceiveProps(newProps){
    if (
      newProps.getShoppersDistributor
       && newProps.getShoppersDistributor.Shopper
       && newProps.getShoppersDistributor.Shopper.distributorsx
    ) {
      let { sadvrId } = this.props.navigation.state.params
      let { shopperId } = this.props
      console.log('is shopperId still being received???');
      if (newProps.getShoppersDistributor.Shopper.distributorsx.length > 0) {
        let { status,id } = newProps.getShoppersDistributor.Shopper.distributorsx[0]
        // DIST EXISTS
        if (status !== false) {
          // DIST IS VERIFIED
          this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,id,true)
        } else {
          // DIST IS NOT VERIFIED
          this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,sadvrId,false)
        }
      } else {
        // DIST DOES NOT EXIST
        this.checkIfShopperHasDmChatWithDistributorInDb(shopperId,sadvrId,false)
      }
    }
  }
  
  checkIfShopperHasDmChatWithDistributorInDb(shopperId,distributorId,withDist){
    if (shopperId && distributorId) {
      let headers = { Authorization: `Bearer ${this.props.gcToken}` }
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
          console.log('checkIfShopperHasDmChatWithDistributorInDb still works after gcToken source change');
          if (res.data.data.allChats.length > 0) {
            let dist = res.data.data.allChats[0]
            let { id } = dist
            let { bizName } = dist.distributorsx[0]
            let { fbkFirstName,fbkLastName } = dist.distributorsx[0].userx
            this.saveNewClaimMessage(id,bizName,fbkFirstName,fbkLastName)
          }
        } else {
          console.log('checkIfShopperHasDmChatWithDistributorInDb no longer works after gcToken source change');
          debugging && console.log('response data not recd for CheckIfShopperHasDmChatWithDistributor query request')
        }
      }).catch( e => {
        if (debugging) console.log('failed to check if shopper has DM chat with Distributor',e.message)
      })
    } else {
      if (debugging) console.log('insufficient inputs to run CheckIfShopperHasDmChatWithDistributor query')
    }
    this.setState({isVerified:withDist})
  }
  
  showModal(modalType,title,description,message=''){
    if (modalType && title) {
      this.setState({modalType,modalContent:{
        title,description,message,
        onConfirmPress: this.sendClaim
      }},()=>{
        this.setState({isModalOpen:true})
      })
    } else {
      this.setState({modalType},()=>{
        this.setState({isModalOpen:true})
      })
    }
  }

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Color Requester',errText)
      },700)
    })
  }

  renderModal(){
    return (
      <Modals
        isOpen={this.state.isModalOpen}
        close={() => this.closeModal()}
        type={this.state.modalType}
        content={this.state.modalContent} 
        onConfirmPress={this.state.onConfirmPress}/>
    )
  }
  
  saveNewClaimMessage(chatId,bizName,fbkFirstName,fbkLastName){
    console.log('is userId prop still working?',this.props.user.id);
    this.setState({
      newClaimMessage: {
        chatId,
        writer: this.props.userId,
        audience: 'ANY'
      },
      bizName,fbkFirstName,fbkLastName
    })
  }
  
  closeModal(){
    this.setState({ isModalOpen:false })
  }
  
  closeNavModal(){
    this.props.navigation.dispatch(NavigationActions.back())
  }
  
  triggerEventOnChatInDb(chatId){
    this.props.triggerEventOnChat({
      variables: {
        chatId,
        updater: JSON.stringify(new Date())
      }
    }).then( () => {
      setTimeout(()=>{
        this.closeNavModal()
      },700)
    }).catch( e => {
      setTimeout(()=>{
        this.closeNavModal()
      },700)
      if (debugging) console.log('could not trigger event on Chat node',e.message);
    })
  }

  sendClaim = () => {
    let errText = 'notifying your distributor about this color request'
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('processing')
        let { newClaimMessage } = this.state
        let claim = {
          ...newClaimMessage,
          text: `${newClaimText} ${this.state.count} ${this.state.colorName}${this.state.count !== 1 ? 's.' : '.'} ${newClaimText2}`
        }
        let { chatId:ChatId,text,writer,audience } = claim
        if (ChatId && text && writer && audience) {
          this.props.createChatMessage({
            variables: { ChatId,text,writer,audience }
          }).then( res => {
            if (res && res.data && res.data.createMessage) {
              this.triggerEventOnChatInDb(claim.chatId)
            } else {
              this.openError(errText)
            }
          }).catch( e => {
            this.openError(errText)
            debugging && console.log(e.message)
          })
        } else {
          this.openError(errText)
        }
      },700)
    })
  }
  
  openClaimConfirmation(){
    let { bizName,fbkFirstName,fbkLastName,isVerified,count,colorName } = this.state
    let distName = bizName ? bizName : `${fbkFirstName} ${fbkLastName}`
    this.showModal('confirm','Confirm Desire',`${AppName} will notify ${isVerified ? distName : 'your distributor'} of your desire to reserve/claim from their inventory the following:${"\n"}${"\n"}Color: ${colorName}${"\n"}Quantity: ${count}${"\n"}${"\n"}If you are also needing other beauty products such as gloss, please send her a private chat.`)
  }
  
  renderRequestButton(){
    if (this.state.count > 0) {
      return (
        <TouchableOpacity 
          style={{...Views.middle,backgroundColor:Colors.purple}}
          onPress={() => this.openClaimConfirmation()}>
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
              onPress={() => this.closeNavModal()}>
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
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }
  
}

const ClaimsWithData = compose(
  graphql(GetShoppersDistributor,{
    name: 'getShoppersDistributor',
    options: props => ({
      variables: {
        shopperId: props.shopperId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(CreateChatMessage,{
    name: 'createChatMessage'
  }),
  graphql(TriggerEventOnChat,{
    name: 'triggerEventOnChat'
  })
)(Claims)

const mapStateToProps = state => ({
  userId: state.user.id,
  shopperId: state.user.shopperx.id,
  gcToken: state.tokens.gc
})

export default connect(mapStateToProps)(ClaimsWithData)