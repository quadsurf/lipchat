

// TESTS


import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

//GQL
import { CheckIfShopperHasDmChatWithDistributor } from '../../api/db/queries'
import { CreateChatMessage,TriggerEventOnChat } from '../../api/db/mutations'

//LIBS
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { withNavigation,NavigationActions } from 'react-navigation'
import axios from 'axios'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

//LOCALS
import { Views,Colors } from '../../css/Styles'
import { FontMatilde,FontPoiret } from '../common/fonts'
import { AppName,method,url,newClaimText,newClaimText2 } from '../../config/Defaults'
import { Modals } from '../../utils/Helpers'

//CONSTs
const duration = 3500
const debugging = __DEV__ && false

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
      isVerified: null,
      newClaimMessage: {}
    }
    this.openClaimConfirmation = debounce(this.openClaimConfirmation,duration,true)
    this.sendClaim = debounce(this.sendClaim,duration,true)
    this.closeModal = debounce(this.closeModal,duration,true)
    this.closeNavModal = debounce(this.closeNavModal,duration,true)
  }

  componentDidMount(){
    let { shopperId,sadvrId,shoppersDistributor } = this.props
    if (shoppersDistributor.hasOwnProperty('id') && shoppersDistributor.hasOwnProperty('status')) {
      let { status,id } = shoppersDistributor
      // DIST EXISTS
      if (status) {
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
          if (res.data.data.allChats.length > 0) {
            let dist = res.data.data.allChats[0]
            let { id } = dist
            let { bizName } = dist.distributorsx[0]
            let { fbkFirstName,fbkLastName } = dist.distributorsx[0].userx
            this.saveNewClaimMessage(id,bizName,fbkFirstName,fbkLastName)
          }
        } else {
          debugging && console.log('response data not recd for CheckIfShopperHasDmChatWithDistributor query request')
        }
      }).catch( e => {
        debugging && console.log('failed to check if shopper has DM chat with Distributor',e.message)
      })
    } else {
      debugging && console.log('insufficient inputs to run CheckIfShopperHasDmChatWithDistributor query')
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
      debugging && console.log('could not trigger event on Chat node',e.message);
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
              this.triggerEventOnChatInDb(ChatId)
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
    this.showModal('confirm','Confirm Desire',`${AppName} will notify ${isVerified ? distName : 'a distributor'} of your desire to reserve/claim from their inventory the following:${"\n"}${"\n"}Color: ${colorName}${"\n"}Quantity: ${count}${"\n"}${"\n"}If you are also needing other beauty products such as gloss, please send her a private chat.`)
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
        <View style={{...Views.middle,backgroundColor:Colors.purpleLight}}>
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
    let { width,height } = this.props
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
      <View style={{flex:1,backgroundColor:this.props.navigation.state.params.rgb}}>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

Claims.propTypes = {
  userId: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  shoppersDistributor: PropTypes.object.isRequired,
  gcToken: PropTypes.string.isRequired,
  sadvrId: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  shopperId: state.shopper.id,
  shoppersDistributor: state.shoppersDistributors.length > 0 ? state.shoppersDistributors[0] : {},
  gcToken: state.tokens.gc,
  sadvrId: state.settings.sadvrId,
  width: state.settings.screenWidth,
  height: state.settings.screenHeight
})

const ClaimsWithData = compose(
  graphql(CreateChatMessage,{
    name: 'createChatMessage'
  }),
  graphql(TriggerEventOnChat,{
    name: 'triggerEventOnChat'
  })
)(Claims)

export default connect(mapStateToProps)(ClaimsWithData)
