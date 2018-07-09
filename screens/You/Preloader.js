

import React, { Component } from 'react'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import axios from 'axios'
import PropTypes from 'prop-types'

// GQL
import { GetUserType,CheckIfDistributorHasGroupChat,GetSettings } from '../../api/db/queries'
import { SubToUserType } from '../../api/db/pubsub'
import { CreateGroupChatForDistributor,UpdateDistributorStatus } from '../../api/db/mutations'

// STORE
import { updateUser,updateDistributor } from '../../store/actions'

// COMPS
import You from './You'
import Loading from '../common/Loading'

// CONSTs
const duration = 3000
const debugging = __DEV__ && false

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

class YouPreloader extends Component {

  state = {
    reloading: false,
    initStatus: null
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
  }

  componentWillReceiveProps(newProps){
    if (
      newProps.getSettings
      && newProps.getSettings.allSettings
      && newProps.getSettings.allSettings.length > 0
    ) {
      this.setState({ initStatus:newProps.getSettings.allSettings[0].initStatus })
    }
  }

  componentDidMount(){
    this.subToUserType()
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
    this.props.updateUser({type:nextType})
    if (nextType === 'DIST') {
      this.checkIfDistributorHasGroupChatInDb()
      this.shouldUpdateDistributorStatus()
    }
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
      if (nextType === 'DIST') {
        this.checkIfDistributorHasGroupChatInDb()
        this.shouldUpdateDistributorStatus()
      }
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  shouldUpdateDistributorStatus(){
    let { distributorId,distributorStatus } = this.props
    let { initStatus } = this.state
    if (initStatus !== null) {
      if (distributorStatus !== initStatus) {
        this.syncDistributorStatusWithInitStatusInDb(distributorId,initStatus)
      }
    }
  }

  syncDistributorStatusWithInitStatusInDb(distributorId,initStatus){
    if (distributorId) {
      this.props.updateDistributorStatus({
        variables: {
          distributorId: distributorId,
          status: initStatus
        }
      }).then(({ data:{ updateDistributor } }) => {
        updateDistributor.hasOwnProperty('status') && this.props.updateDistributor({
          status:updateDistributor.status
        })
      }).catch( e => {
        debugging && console.log('e',e.message)
      })
    }
  }

  checkIfDistributorHasGroupChatInDb(){
    let method = 'post'
    let url = `https://api.graph.cool/simple/v1/${PROJECT_ID}`
    let { gcToken,distributorId } = this.props
    let headers = {
      Authorization: `Bearer ${gcToken}`,
      "Content-Type": "application/json"
    }
    if (PROJECT_ID && gcToken && distributorId) {
      axios({
        headers,method,url,
        data: {
          query: CheckIfDistributorHasGroupChat,
          variables: {
            distributorsx: {id:distributorId}
          }
        }
      }).then( ({ data: { data: { allChats=[] } } }) => {
        if (allChats.length > 0) {
          debugging && console.log('distributor already has a group chat, so no need to create');
        } else {
          this.createGroupChatForDistributorInDb()
        }
      }).catch( e => {
        debugging && console.log('e',e.message)
      })
    }
  }

  createGroupChatForDistributorInDb(){
    let { distributorId } = this.props
    if (distributorId) {
      this.props.createGroupChatForDistributor({
        variables: {
          distributorsx: distributorId
        }
      }).then( ({ data: { createChat={} } }) => {
        if (createChat.hasOwnProperty('id')) {
          debugging && console.log('successfully created a new group chat for the new distributor')
        }
      }).catch( e => {
        debugging && console.log('failed to create group chat for distributor in db',e.message);
      })
    } else {
      debugging && console.log('insufficient inputs to create group chat for distributor in db');
    }
  }

  render(){
    if (this.state.reloading) {
      return <Loading text="reloading profile..."/>
    } else {
      return <You updateUserTypeInApp={this.updateUser.bind(this)}/>
    }
  }

}

YouPreloader.propTypes = {
  gcToken: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  userType: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  distributorStatus: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  gcToken: state.tokens.gc,
  userId: state.user.id,
  userType: state.user.type,
  distributorId: state.distributor.id,
  distributorStatus: state.distributor.status
})

const YouPreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  }),
  graphql(GetSettings,{
    name: 'getSettings'
  }),
  graphql(CreateGroupChatForDistributor,{
    name: 'createGroupChatForDistributor'
  }),
  graphql(UpdateDistributorStatus,{
    name: 'updateDistributorStatus'
  })
)(YouPreloader)

export default connect(mapStateToProps,{ updateUser,updateDistributor })(YouPreloaderWithData)
