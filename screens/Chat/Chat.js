

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

// LIBS
import PropTypes from 'prop-types'

// STORE
import { connect } from 'react-redux'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'
import { Modals } from '../../utils/Helpers'

// CONSTs
const debugging = __DEV__ && false

// COMPONENTS
import ChatCard from './ChatCard'

class Chat extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {}
    }
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

  openError(errText){
    this.setState({isModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('err','Chat',errText)
      },700)
    })
  }

  renderChats(){
    let { chats,userType,distributorStatus,shopperId,hasShoppersDistributor,screenHeight } = this.props
    if (chats.length > 0) {
      return chats.map( chat => {
        switch(userType){
          case 'SHOPPER':
              if (!hasShoppersDistributor && chat.type === 'DMSH2DIST') {
                return null
              } else {
                return <ChatCard key={chat.id} chat={chat}/>
              }
          case 'DIST':
              if (!distributorStatus && chat.type === 'DMSH2DIST') {
                return null
              } else {
                return <ChatCard key={chat.id} chat={chat}/>
              }
          case 'SADVR':
              if (chat.type === 'DMU2ADMIN' && chat.shoppersx[0].id === shopperId) {
                return null
              }
              return <ChatCard key={chat.id} chat={chat}/>
          default: return null
        }
      })
    } else {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret
            text="loading chats..."
            color={Colors.blue}
            size={Texts.larger.fontSize} style={{
              marginTop: (screenHeight/3)
            }}/>
        </View>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{
        flex: this.props.chats ? 0 : 1,
        paddingBottom:6
      }}>
        {this.renderChats()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <FontPoiret text="Chats" size={Texts.xlarge.fontSize} color={Colors.blue}/>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

Chat.propTypes = {
  chats: PropTypes.array.isRequired,
  userType: PropTypes.string.isRequired,
  distributorStatus: PropTypes.bool.isRequired,
  shopperId: PropTypes.string.isRequired,
  hasShoppersDistributor: PropTypes.bool.isRequired,
  screenHeight: PropTypes.number.isRequired
}

const mapStateToProps = state => ({
  chats: state.chats,
  userType: state.user.type,
  distributorStatus: state.distributor.status,
  shopperId: state.shopper.id,
  hasShoppersDistributor: state.shoppersDistributors.length > 0 ? true : false,
  screenHeight: state.settings.screenHeight
})

export default connect(mapStateToProps)(Chat)
