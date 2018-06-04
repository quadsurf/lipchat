

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { GetUserType,GetDistributorStatus,GetAllDistributorsStatusForShopper } from '../../api/db/queries'
import { SubToUserType,SubToDistributorStatus,SubToDistributorsForShopper } from '../../api/db/pubsub'

// STORE
import { updateUser,updateDistributor,updateShoppersDistributor } from '../../store/actions'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'

// COMPS
import Chat from './Chat'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

class ChatPreloader extends Component {

  state = {
    reloading: false
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
    this.updateDistributor = debounce(this.updateDistributor,duration,true)
    this.modifyShoppersDistributor = debounce(this.modifyShoppersDistributor,duration,true)
  }

  componentDidMount(){
    this.subToUserType()
    this.subToDistributorStatus()
    this.subToAllDistributorsStatusForShopper()
  }

  subToUserType(){
    let { userId } = this.props
    if (userId) {
      this.props.getUserType.subscribeToMore({
        document: SubToUserType,
        variables: { UserId: userId },
        updateQuery: (previous,{ subscriptionData }) => {
          let { mutation,node:{ type:nextType },previousValues:{ type:prevType } } = subscriptionData.data.User
          if (mutation === 'UPDATED') {
            nextType !== prevType && this.updateUser(nextType)
          }
        }
      })
    }
  }

  updateUser(nextType){
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  subToDistributorStatus(){
    let { distributorId } = this.props
    if (distributorId) {
      this.props.getDistributorStatus.subscribeToMore({
        document: SubToDistributorStatus,
        variables: { DistributorId: distributorId },
        updateQuery: (previous,{ subscriptionData }) => {
          let {
            mutation,
            node:{ status:nextStatus },
            previousValues:{ status:prevStatus }
          } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            nextStatus !== prevStatus && this.updateDistributor(nextStatus)
          }
        }
      })
    }
  }

  updateDistributor(nextStatus){
    this.setState({reloading:true},()=>{
      this.props.updateDistributor({status:nextStatus})
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  subToAllDistributorsStatusForShopper(){
    let { shopperId } = this.props
    if (shopperId) {
      this.props.getAllDistributorsStatusForShopper.subscribeToMore({
        document: SubToDistributorsForShopper,
        variables: {
          ShopperId: { "id": shopperId }
        },
        updateQuery: (previous,{subscriptionData}) => {
          let { mutation } = subscriptionData.data.Distributor
          if (mutation === 'UPDATED') {
            this.modifyShoppersDistributor(subscriptionData.data.Distributor.node)
          }
        }
      })
    }
  }

  modifyShoppersDistributor(dist){
    this.setState({reloading:true},()=>{
      this.props.updateShoppersDistributor(dist)
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  render(){
    if (this.state.reloading) {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret
            text="reloading chats..."
            color={Colors.blue}
            size={Texts.larger.fontSize}
            style={{marginBottom:30}}/>
          <DotsLoader
            size={15}
            color={Colors.blue}
            frequency={5000}/>
        </View>
      )
    } else {
      return <Chat/>
    }
  }

}

ChatPreloader.propTypes = {
  userId: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id
})

const ChatPreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  }),
  graphql(GetDistributorStatus,{
    name: 'getDistributorStatus',
    options: props => ({
      variables: {
        DistributorId: props.distributorId
      }
    })
  }),
  graphql(GetAllDistributorsStatusForShopper,{
    name: 'getAllDistributorsStatusForShopper',
    options: props => ({
      variables: {
        ShopperId: { id: props.shopperId }
      },
      fetchPolicy: 'network-only'
    })
  })
)(ChatPreloader)

export default connect(mapStateToProps,{
  updateUser,updateDistributor,updateShoppersDistributor
})(ChatPreloaderWithData)