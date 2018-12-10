

import React, { Component } from 'react'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { GetColorsAndInventories,GetUserType } from '../../api/db/queries'
import { SubToUserType } from '../../api/db/pubsub'

// STORE
import { setColors,updateUser } from '../../store/actions'

// COMPS
import Selfie from './Selfie'
import Loading from '../common/Loading'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

class SelfiePreloader extends Component {

  state = {
    reloading: false,
    colorsLoaded: false
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
  }

  componentDidMount(){
    this.props.userId && this.subToUserType()
  }

  subToUserType(){
    this.props.getUserType.subscribeToMore({
      document: SubToUserType,
      variables: { UserId: this.props.userId },
      updateQuery: (previous,{ subscriptionData }) => {
        let { mutation,node:{ type:nextType },previousValues:{ type:prevType } } = subscriptionData.data.User
        if (mutation === 'UPDATED') {
          nextType !== prevType && this.updateUser(nextType)
        }
      }
    })
  }

  componentWillReceiveProps(newProps){
    console.log(newProps.getColorsAndInventories)
    if (
      newProps.getColorsAndInventories &&
      newProps.getColorsAndInventories.allColors &&
      newProps.getColorsAndInventories.allColors.length > 0
    ) {
      this.props.setColors(newProps.getColorsAndInventories.allColors)
      this.setState({ colorsLoaded:true })
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
    let { reloading,colorsLoaded } = this.state
    if (reloading) {
      return <Loading text="reloading selfie..."/>
    } else {
      if (colorsLoaded) {
        return <Selfie authenticated={this.props.userId ? true : false}/>
      } else {
        return <Loading text="loading colors..."/>
      }
    }
  }

}

SelfiePreloader.propTypes = {
  userId: PropTypes.string.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id
})

const SelfiePreloaderWithData = compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.distributorId,
        shopperxId: props.shopperId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  })
)(SelfiePreloader)

export default connect(mapStateToProps,{ setColors,updateUser })(SelfiePreloaderWithData)
