

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import { GetUserType,GetDistributorStatus } from '../../api/db/queries'
import { SubToUserType,SubToDistributorStatus } from '../../api/db/pubsub'

// STORE
import { updateUser,updateDistributor } from '../../store/actions'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'

// COMPS
import LipColors from './LipColors'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

class LipColorsPreloader extends Component {

  state = {
    reloading: false,
    tabIsFocused: this.props.focused
  }

  constructor(props){
    super(props)
    this.updateUser = debounce(this.updateUser,duration,true)
    this.updateDistributor = debounce(this.updateDistributor,duration,true)
    this.updateTabFocus = debounce(this.updateTabFocus,500,true)
  }

  componentWillReceiveProps(newProps){
    if (newProps.hasOwnProperty('focused') && newProps.focused !== this.props.focused) {
      this.updateTabFocus(newProps.focused)
    }
  }

  updateTabFocus(tabIsFocused){
    this.setState({ tabIsFocused })
  }

  componentDidMount(){
    this.subToUserType()
    this.subToDistributorStatus()
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
    let { tabIsFocused } = this.state
    console.log('tabIsFocused on LipColors',tabIsFocused)
    if (tabIsFocused) {
      this.setState({reloading:true},()=>{
        this.props.updateUser({type:nextType})
        setTimeout(()=>{
          this.setState({reloading:false})
        },duration)
      })
    }
  }

  subToDistributorStatus(){
    let { distributorId } = this.props
    let { tabIsFocused } = this.state
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
            tabIsFocused && nextStatus !== prevStatus && this.updateDistributor(nextStatus)
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

  render(){
    if (this.state.reloading) {
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret
            text="reloading colors..."
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
      return <LipColors/>
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
