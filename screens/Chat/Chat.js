

import React, { Component } from 'react'
import {
  Text,
  View
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetChatsForShopper,GetChatsForDistributor } from '../../api/db/queries'
import { SubShoppersChats,SubDistributorsChats } from '../../api/db/pubsub'


// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

// COMPONENTS
import ChatCard from './ChatCard'

class Chat extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user ? this.props.user : null,
    userType: this.props.user && this.props.user.type ? this.props.user.type : null,
    chats: null
  }

  componentWillMount(){
    console.log('userId',this.props.user.id);
    console.log('shopperId',this.props.user.shopperx.id);
    console.log('distributorId',this.props.user.distributorx.id);
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.state !== nextState) {
      return true
    }
    return false
  }

  componentWillReceiveProps(newProps){
    if (newProps) {

      if (newProps !== this.props) {

        if (this.state.userType === 'DIST') {

          if (
            newProps.getChatsForDistributor
            && Array.isArray(newProps.getChatsForDistributor.allChats)
          ) {

            if (newProps.getChatsForDistributor.allChats !== this.state.chats) {
              this.setState({chats:newProps.getChatsForDistributor.allChats})
            }
          }

        }

        if (this.state.userType === 'SHOPPER') {

          if (
            newProps.getChatsForShopper
            && Array.isArray(newProps.getChatsForShopper.allChats)
          ) {

            if (newProps.getChatsForShopper.allChats !== this.state.chats) {
              this.setState({chats:newProps.getChatsForShopper.allChats})
            }
          }

        }

      }
    }
  }

  componentDidMount(){
    this.subToShoppersChats()
    this.subToDistributorsChats()
  }

  subToShoppersChats(){
    if (this.props.user && this.props.user.shopperx)
    this.props.getChatsForShopper.subscribeToMore({
      document: SubShoppersChats,
      variables: {ShopperId:{"id":this.props.user.shopperx.id}},
      updateQuery: (previous, { subscriptionData }) => {
        console.log('new Chats for Shopper',subscriptionData);
        this.setState({chats:[
          ...previous.allChats,
          subscriptionData.data.Chat.node
        ]})
      }
    })
  }

  subToDistributorsChats(){
    if (this.props.user && this.props.user.distributorx)
    this.props.getChatsForDistributor.subscribeToMore({
      document: SubDistributorsChats,
      variables: {DistributorId:{"id":this.props.user.distributorx.id}},
      updateQuery: (previous, { subscriptionData }) => {
        console.log('new Chats for Distributor',subscriptionData);
        this.setState({chats:[
          ...previous.allChats,
          subscriptionData.data.Chat.node
        ]})
      }
    })
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
    if (this.state.chats) {
      return this.state.chats.map( chat => {
        return <ChatCard key={chat.id} chat={chat} userType={this.state.userType} viewersStatus={this.props.user.distributorx.status}/>
      })
    } else {
      return <FontPoiret text="No Chats Yet" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
    }
  }

  renderMainContent(){
    return (
      <View style={{...Views.middle}}>
        <FontPoiret text="Chats" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
        {this.renderChats()}
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

}

export default compose(
  graphql(GetChatsForDistributor,{
    name: 'getChatsForDistributor',
    options: props => ({
      variables: {
        DistributorId: {
          id: props.user && props.user.distributorx && props.user.distributorx.id ? props.user.distributorx.id : ''
        }
      }
    })
  }),
  graphql(GetChatsForShopper,{
    name: 'getChatsForShopper',
    options: props => ({
      variables: {
        ShopperId: {
          id: props.user && props.user.shopperx && props.user.shopperx.id ? props.user.shopperx.id : ''
        }
      }
    })
  })
)(Chat)
