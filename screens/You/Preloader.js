

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'
import axios from 'axios'
import PropTypes from 'prop-types'

// GQL
import { GetUserType } from '../../api/db/queries'
import { SubToUserType } from '../../api/db/pubsub'
import { CheckIfDistributorHasGroupChat } from '../../api/db/queries'

// STORE
import { updateUser } from '../../store/actions'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../common/fonts'

// COMPS
import You from './You'

// CONSTS
const duration = 3000
const debugging = __DEV__ && false

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

class YouPreloader extends Component {

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
    this.setState({reloading:true},()=>{
      this.props.updateUser({type:nextType})
      nextType === 'DIST' && this.checkIfDistributorHasGroupChat()
      setTimeout(()=>{
        this.setState({reloading:false})
      },duration)
    })
  }

  checkIfDistributorHasGroupChat(){
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
      return (
        <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
          <FontPoiret
            text="reloading profile..."
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
      return <You/>
    }
  }

}

YouPreloader.propTypes = {
  gcToken: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  gcToken: state.tokens.gc,
  userId: state.user.id,
  distributorId: state.distributor.id
})

const YouPreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  })
)(YouPreloader)

export default connect(mapStateToProps,{ updateUser })(YouPreloaderWithData)
