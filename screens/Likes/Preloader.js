

import React, { Component } from 'react'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'

// GQL
import { GetUserType,GetAllDistributorsStatusForShopper } from '../../api/db/queries'
import { SubToUserType,SubToDistributorsForShopper } from '../../api/db/pubsub'

// STORE
import { updateUser,updateShoppersDistributor } from '../../store/actions'

// COMPS
import Likes from './Likes'
import Loading from '../common/Loading'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

@withNavigation
class LikesPreloader extends Component {

  state = {
    reloading: false,
    isMounted: true
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
    this.modifyShoppersDistributor = debounce(this.modifyShoppersDistributor,duration,true)
  }

  componentWillMount(){
    let { isMounted } = this.state
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      ({ action:{ key } }) => {
        key !== 'StackRouterRoot' && !this.state.isFocused && isMounted && this.setState({tabIsFocused:true})
        debugging && console.log('didFocus on Likes:',key)
      }
    )
    this.didBlurSubscription = this.props.navigation.addListener(
      'didBlur',
      ({ action:{ key } }) => {
        key !== 'StackRouterRoot' && isMounted && this.setState({tabIsFocused:false})
        debugging && console.log('didBlur on Likes:',key)
      }
    )
  }

  componentWillUnmount(){
    this.setState({ isMounted:false })
  }

  componentDidMount(){
    this.subToUserType()
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
    this.props.updateUser({type:nextType})
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
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
    this.props.updateShoppersDistributor(dist)
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateShoppersDistributor(dist)
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  render(){
    if (this.state.reloading) {
      return <Loading text="reloading favorites..."/>
    } else {
      return <Likes/>
    }
  }

}

LikesPreloader.propTypes = {
  userId: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  shopperId: state.shopper.id
})

const LikesPreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
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
)(LikesPreloader)

export default connect(mapStateToProps,{
  updateUser,updateShoppersDistributor
})(LikesPreloaderWithData)
