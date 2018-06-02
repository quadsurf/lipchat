

import React, { Component } from 'react'
import { View } from 'react-native'

// LIBS
import { connect } from 'react-redux'
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import PropTypes from 'prop-types'

// GQL
import { GetUserType } from '../../api/db/queries'
import { SubToUserType } from '../../api/db/pubsub'

// STORE
import { updateUser } from '../../store/actions'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'

// COMPS
import LipColors from './LipColors'

// CONSTS
const debugging = __DEV__ && false

class LipColorsPreloader extends Component {

  state = {
    reloading: false
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
            if (nextType !== prevType) {
              this.setState({reloading:true},()=>{
                this.props.updateUser({type:nextType})
                setTimeout(()=>{
                  this.setState({reloading:false})
                },3000)
              })
            }
          }
        }
      })
    }
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
  userId: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id
})

const LipColorsPreloaderWithData = compose(
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.userId
      }
    })
  })
)(LipColorsPreloader)

export default connect(mapStateToProps,{ updateUser })(LipColorsPreloaderWithData)
