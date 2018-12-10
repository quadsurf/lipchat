

import React, { Component } from 'react'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { GetUserType,GetDistributorStatus } from '../../api/db/queries'
import { SubToUserType,SubToDistributorStatus } from '../../api/db/pubsub'

// STORE
import { updateUser,updateDistributor } from '../../store/actions'

// COMPS
import LipColors from './LipColors'
import Loading from '../common/Loading'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

class LipColorsPreloader extends Component {

  state = {
    reloading: false
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
    this.updateDistributor = debounce(this.updateDistributor,duration,true)
  }

  componentDidMount(){
    this.props.userId && this.subToUserType(this.props.userId)
    this.props.distributorId && this.subToDistributorStatus(this.props.distributorId)
  }

  subToUserType(id){
    this.props.getUserType.subscribeToMore({
      document: SubToUserType,
      variables: { UserId: id },
      updateQuery: (previous,{ subscriptionData }) => {
        let { mutation,node:{ type:nextType },previousValues:{ type:prevType } } = subscriptionData.data.User
        if (mutation === 'UPDATED') {
          nextType !== prevType && this.updateUser(nextType)
        }
      }
    })
  }

  updateUser(nextType){
    this.props.updateUser({type:nextType})
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  subToDistributorStatus(id){
    this.props.getDistributorStatus.subscribeToMore({
      document: SubToDistributorStatus,
      variables: { DistributorId: id },
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

  updateDistributor(nextStatus){
    this.props.updateDistributor({status:nextStatus})
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateDistributor({status:nextStatus})
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  render(){
    if (this.state.reloading) {
      return <Loading text="reloading colors..."/>
    } else {
      return <LipColors authenticated={this.props.userId ? true : false}/>
    }
  }

}

LipColorsPreloader.propTypes = {
  userId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  distributorId: state.distributor.id
})

const LipColorsPreloaderWithData = compose(
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
  })
)(LipColorsPreloader)

export default connect(mapStateToProps,{ updateUser,updateDistributor })(LipColorsPreloaderWithData)
