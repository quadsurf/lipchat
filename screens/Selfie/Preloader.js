

import React, { Component } from 'react'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { GetUserType } from '../../api/db/queries'
import { SubToUserType } from '../../api/db/pubsub'

// STORE
import { updateUser } from '../../store/actions'

// COMPS
import Selfie from './Selfie'
import Loading from '../common/Loading'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

class SelfiePreloader extends Component {

  state = {
    reloading: false
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
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
    return // avoiding unmounted component state side effects from inconsistent unsubscribers
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  render(){
    if (this.state.reloading) {
      return <Loading text="reloading selfie..."/>
    } else {
      return <Selfie/>
    }
  }

}

SelfiePreloader.propTypes = {
  userId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id
})

const SelfiePreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  })
)(SelfiePreloader)

export default connect(mapStateToProps,{ updateUser })(SelfiePreloaderWithData)
