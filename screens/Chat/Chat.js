

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//ENV VARS


// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetChatsForShopper,GetChatsForDistributor,GetAllDistributorsStatusForShopper,GetUserType } from '../../api/db/queries'
import { SubToShoppersChats,SubToDistributorsChats,SubToDistributorsForShopper } from '../../api/db/pubsub'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'

// CONSTs


// COMPONENTS
import ChatCard from './ChatCard'

class Chat extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user ? this.props.user : null,
    // userType: this.props.user && this.props.user.type ? this.props.user.type : null,
    userType: this.props.userType ? this.props.userType : null,
    chats: null
  }

  componentWillMount(){
    // console.log('userId',this.props.user.id);
    // console.log('shopperId',this.props.user.shopperx.id);
    // console.log('distributorId',this.props.user.distributorx.id);
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
    return false
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
        let type = newProps && newProps.getUserType && newProps.getUserType.User && newProps.getUserType.User.type ? newProps.getUserType.User.type : this.state.userType
        if (type === 'DIST') {
            this.chatsForDist(newProps)
        }
        if (type === 'SHOPPER') {
            this.chatsForShopper(newProps)
        }
    }
  }

  chatsForDist(newProps){
    if (
      newProps.getChatsForDistributor && newProps.getChatsForDistributor.allChats
      && Array.isArray(newProps.getChatsForDistributor.allChats)
    ) {
        if (newProps.getChatsForDistributor.allChats !== this.state.chats) {
          this.setState({chats:newProps.getChatsForDistributor.allChats})
        }
    }
  }

  chatsForShopper(newProps){
    if (
      newProps.getChatsForShopper && newProps.getChatsForShopper.allChats
      && Array.isArray(newProps.getChatsForShopper.allChats)
    ) {
        if (newProps.getChatsForShopper.allChats !== this.state.chats) {
          this.setState({chats:newProps.getChatsForShopper.allChats})
        }
    }
    if (
      newProps.getAllDistributorsStatusForShopper
      && newProps.getAllDistributorsStatusForShopper.allDistributors
      && Array.isArray(newProps.getAllDistributorsStatusForShopper.allDistributors)
    ) {
      if (newProps.getAllDistributorsStatusForShopper.allDistributors !== this.state.allDistributorsStatusForShopper) {
        this.setState({
          allDistributorsStatusForShopper: newProps.getAllDistributorsStatusForShopper.allDistributors
        })
      }
    }
  }

  componentDidMount(){
    this.subToShoppersChats()
    this.subToDistributorsChats()
    this.subToAllDistributorsStatusForShopper()
  }

  subToShoppersChats(){
    if (this.props.user && this.props.user.shopperx && this.props.user.shopperx.id) {
      this.props.getChatsForShopper.subscribeToMore({
        document: SubToShoppersChats,
        variables: {ShopperId:{"id":this.props.user.shopperx.id}},
        updateQuery: (previous, { subscriptionData }) => {
          let mutation = subscriptionData.data.Chat.mutation
          if (mutation === 'CREATED') {
            this.setState({
              chats: [
                ...this.state.chats,
                subscriptionData.data.Chat.node
              ]
            })
          }
          if (mutation === 'DELETED') {
            let chats = JSON.parse(JSON.stringify(this.state.chats))
            let i = chats.findIndex( chat => {
            	return chat.id === subscriptionData.data.Chat.previousValues.id
            })
            if (i !== -1) {
              chats.splice(i,1)
              this.setState({chats})
            }
          }
        },
        onError: err => {
          console.log('subscription err:',err);
        }
      })
    }
  }

  subToDistributorsChats(){
    if (this.props.user && this.props.user.distributorx && this.props.user.distributorx.id) {
      this.props.getChatsForDistributor.subscribeToMore({
        document: SubToDistributorsChats,
        variables: {DistributorId:{"id":this.props.user.distributorx.id}}
      })
    }
  }

  subToAllDistributorsStatusForShopper(){
    if (this.props.user && this.props.user.shopperx && this.props.user.shopperx.id) {
      this.props.getAllDistributorsStatusForShopper.subscribeToMore({
        document: SubToDistributorsForShopper,
        variables: {ShopperId:{"id":this.props.user.shopperx.id}}
      })
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
    // this.props.user.distributorx.status
    if (this.state.chats) {
      return this.state.chats.map( chat => {
        return <ChatCard key={chat.id} chat={chat} userType={this.state.userType} viewersStatus={this.props.distributorStatus} nav={this.props.nav}/>
      })
    } else {
      return (
        <DotsLoader
          size={15}
          color={Colors.pink}
          frequency={5000}/>
      )
    }
  }

  renderMainContent(){
    return (
      <ScrollView contentContainerStyle={{flex:0,paddingBottom:6}}>
        {this.renderChats()}
      </ScrollView>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        <FontPoiret text="Chats" style={{fontSize:Texts.xlarge.fontSize,color:Colors.blue}}/>
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
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetChatsForShopper,{
    name: 'getChatsForShopper',
    options: props => ({
      // pollInterval: 5000,
      variables: {
        ShopperId: {
          id: props.user && props.user.shopperx && props.user.shopperx.id ? props.user.shopperx.id : ''
        }
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetAllDistributorsStatusForShopper,{
    name: 'getAllDistributorsStatusForShopper',
    options: props => ({
      variables: {
        ShopperId: {
          id: props.user && props.user.shopperx && props.user.shopperx.id ? props.user.shopperx.id : ''
        }
      },
      fetchPolicy: 'network-only'
    })
  })
)(Chat)
