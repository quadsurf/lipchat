

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// STORE
import { connect } from 'react-redux'

// GQL
import { GetColorsAndInventories,GetLikesForShopper } from './../../api/db/queries'
// import { SubUserType } from '../api/db/pubsub'
import {
  ConnectColorToDistributor,UpdateCountOnInventory,CreateLike,UpdateDoesLikeOnLike
} from '../../api/db/mutations'
import { SubToLikesForShopper } from './../../api/db/pubsub'

// LOCALS
import { Views,Colors } from '../../css/Styles'
import { Modals,getDimensions } from '../../utils/Helpers'
import { notApprovedToAddInventory } from '../../config/Defaults'

// COMPONENTS
import ColorCard from './ColorCard'
import ColorHeader from './ColorHeader'

// CONSTS
const { width:screenWidth } = getDimensions()
const separatorOffset = 120
const shortUIdebounce = 1000
const longUIdebounce = 3000
const networkDebounce = 4000
const debugging = __DEV__ && false

class LipColors extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      colors: [],
      isListReady: false,
      hasColors: false,
      redsIsOpen: false,
      orangesIsOpen: false,
      bluesIsOpen: false,
      purplesIsOpen: false,
      pinksIsOpen: false,
      berriesIsOpen: false,
      brownsIsOpen: false,
      neutralsIsOpen: false,
      reds: [],
      oranges: [],
      blues: [],
      purples: [],
      pinks: [],
      berries: [],
      browns: [],
      neutrals: [],
      redsAutoLoadedCount: 0
    }

    this.handleReds = debounce(this.handleReds,1400,true)
    this.toggleFamilyOpenState = this.toggleFamilyOpenState.bind(this)
    this.checkIfLikeExists = debounce(this.checkIfLikeExists.bind(this),networkDebounce,true)
    this.checkIsEditingMode = this.checkIsEditingMode.bind(this)
    this.checkIfInventoryExists = debounce(this.checkIfInventoryExists.bind(this),networkDebounce,true)
    this.cancelInventoryUpdater = debounce(this.cancelInventoryUpdater.bind(this),shortUIdebounce,true)
  }

  subToLikesInDb(){
    if (this.props.userType === 'SHOPPER') {
      let { shopperId } = this.props
      if (shopperId) {
        this.props.getLikesForShopper.subscribeToMore({
          document: SubToLikesForShopper,
          variables: {
            shopperId: { id:shopperId }
          },
          updateQuery: (previous,{ subscriptionData }) => {
            const { node={},mutation='' } = subscriptionData.data.Like
            if (mutation === 'CREATED' || mutation === 'UPDATED') {
              if (node.hasOwnProperty('id')) this.normalizeColor(node)
            }
          }
        })
      }
    }
  }

  normalizeColor(node){
    let updates = {
      colorId: node.colorx.id,
      family: node.colorx.family.toLowerCase(),
      doesLike: node.doesLike,
      likeId: node.id
    }
    this.updateColorStateOnFamily(updates,null,'pubsub')
  }

  componentDidMount(){
    this.subToLikesInDb()
  }

  componentWillReceiveProps(newProps){
    if (newProps.colors !== this.props.colors) {
      if (newProps.colors !== this.state.colors) {
        this.setState({colors:newProps.colors},()=>{
          this.handleReds()
        })
      }
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
        this.showModal('err','Lip Colors',errText)
      },700)
    })
  }

  handleReds(){
    this.setState({redsAutoLoadedCount:this.state.redsAutoLoadedCount+1},()=>{
      if (this.state.redsAutoLoadedCount < 2) {
        this.filterColors('reds')
      }
    })
  }

  filterColors(fam,cameFrom){
    let filteredColors = this.state.colors.filter(({family}) => family === fam)
    this.setState({[`${fam}`]:filteredColors},()=>{
      this.toggleFamilyOpenState(fam)
    })
  }

  renderColors(colors){
    return colors.map(color => {
      return <ColorCard
        key={color.colorId}
        color={color}
        userType={this.props.userType}
        onLikePress={this.checkIfLikeExists}
        isEditing={this.state[`isEditing-${color.colorId}`]}
        onMinusPress={this.checkIsEditingMode}
        onAddPress={this.checkIsEditingMode}
        onCancelPress={this.cancelInventoryUpdater}
        onUpdatePress={this.checkIfInventoryExists}/>
    })
  }

  toggleFamilyOpenState(family){
    let isOpen = this.state[`${family}IsOpen`]
    if (!isOpen) {
      if (this.state[`${family}`].length === 0) {
        this.filterColors(family,'came from toggler')
      } else {
        this.setState({[`${family}IsOpen`]:!isOpen})
      }
    } else {
      this.setState({[`${family}IsOpen`]:!isOpen})
    }
  }

  renderColorHeader(family){
    return (
      <ColorHeader
        family={family}
        onHeaderPress={this.toggleFamilyOpenState}
        isOpen={this.state[`${family}IsOpen`]}
        offset={separatorOffset}/>
    )
  }

  renderMainContent(){
    let {
      redsIsOpen,
      orangesIsOpen,
      bluesIsOpen,
      purplesIsOpen,
      berriesIsOpen,
      pinksIsOpen,
      brownsIsOpen,
      neutralsIsOpen,
      isListReady,
      reds,
      oranges,
      blues,
      purples,
      berries,
      pinks,
      browns,
      neutrals
    } = this.state
    return (
      <View style={{flex:1}}>
        <ScrollView
          contentContainerStyle={{
            marginBottom:56,
            justifyContent:'center',
            alignItems:'center'
          }}>
            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  redsIsOpen && reds.length > 0
                    ? this.renderColors(reds)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('reds')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  orangesIsOpen && oranges.length > 0
                    ? this.renderColors(oranges)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('oranges')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  bluesIsOpen && blues.length > 0
                    ? this.renderColors(blues)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('blues')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  purplesIsOpen && purples.length > 0
                    ? this.renderColors(purples)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('purples')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  berriesIsOpen && berries.length > 0
                    ? this.renderColors(berries)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('berries')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  pinksIsOpen && pinks.length > 0
                    ? this.renderColors(pinks)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('pinks')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  brownsIsOpen && browns.length > 0
                    ? this.renderColors(browns)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('browns')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  neutralsIsOpen && neutrals.length > 0
                    ? this.renderColors(neutrals)
                    : <View style={{width:screenWidth}}/>
                }
              </View>
              {this.renderColorHeader('neutrals')}
            </View>
        </ScrollView>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.purpleLight}}>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  updateColorStateOnFamily(color,op,onType){
    let colors = this.state[`${color.family}`]
    let i = colors.findIndex(({colorId}) => colorId === color.colorId)
    if (i !== -1) {
      let newColor = {
        ...colors[i],
        ...color,
        count: (op === '+'
         ? color.count+1
         : op === '-'
         ? color.count-1
         : onType === 'pubsub' || onType === 'onUpdateLike'
         ? colors[i].count
         : color.count)
      }
      colors.splice(i,1,newColor)
      this.setState({[`${color.family}`]:colors})
      if (onType === 'onUpdate' || onType === 'onCancel') {
        this.setState({
          [`isEditing-${color.colorId}`]:false,
          [`resetCountFor-${color.colorId}`]:null
        })
        if (this.state.isModalOpen) {
          setTimeout(()=>{
              this.setState({isModalOpen:false})
            },1400)
        }
      }
    }
  }

  checkCount(color,op){
    if (op === '-' && color.count < 1) {
    } else {
      this.updateColorStateOnFamily(color,op,'onCount')
    }
  }

  checkIsEditingMode(color,op){
    if (this.state[`isEditing-${color.colorId}`]) {
      this.checkCount(color,op)
    } else {
      if (this.props.distributorStatus) {
        this.setState({
          [`isEditing-${color.colorId}`]: true,
          [`resetCountFor-${color.colorId}`]: color.count
        },()=>{
          this.checkCount(color,op)
        })
      } else {
        this.showModal('prompt','Distributor Status',notApprovedToAddInventory)
      }
    }
  }

  cancelInventoryUpdater({colorId,family}){
    let updates = {
      colorId,
      family,
      count: this.state[`resetCountFor-${colorId}`]
    }
    this.updateColorStateOnFamily(updates,null,'onCancel')
  }

  checkIfInventoryExists({inventoryId,colorId,count,family}){
    this.showModal('processing')
    if (inventoryId) {
      this.updateInventoryInDb(inventoryId,colorId,count,family)
    } else {
      this.createInventoryInDb(this.props.distributorId,colorId,count,family)
    }
  }

  createInventoryInDb(distId,colorId,newCount,family){
    let errText = 'setting up inventory for this color'
    if (distId && colorId && newCount) {
      this.props.connectColorToDistributor({
        variables: {
          distId,
          colorId,
          count: newCount
        }
      }).then( ({ data:{ createInventory=false } }) => {
        if (createInventory.hasOwnProperty('id')) {
          // count = count !== newCount ? count : newCount
          let updates = {
            colorId,
            family,
            inventoryId: createInventory.id,
            count: createInventory.count
          }
          this.updateColorStateOnFamily(updates,null,'onUpdate')
        } else {
          this.openError(errText)
        }
      }).catch( e => {
        this.openError(errText)
      })
    } else {
      this.openError(errText)
    }
  }

  updateInventoryInDb(inventoryId,colorId,count,family){
    let errText = 'updating your inventory for this color'
    if (inventoryId && Number.isInteger(count) && count >= 0) {
      this.props.updateCountOnInventory({
        variables: { inventoryId,count }
      }).then( ({ data:{ updateInventory=false } }) => {
        if (updateInventory.hasOwnProperty('count')) {
          let updates = {
            colorId,
            family,
            count: updateInventory.count
          }
          this.updateColorStateOnFamily(updates,null,'onUpdate')
        } else {
          console.log('err1');
          this.openError(errText)
        }
      }).catch( e => {
        this.openError(errText)
      })
    } else {
      console.log('err3');
      this.openError(errText)
    }
  }

  checkIfLikeExists(color){
    let { shopperId } = this.props
    if (color.likeId) {
      this.updateDoesLikeOnLikeInDb(color)
    } else {
      this.createLikeInDb(shopperId,color)
    }
  }

  createLikeInDb(ShopperId,{ colorId:ColorId,family }){
    let errText = 'creating a like for this color'
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: { ShopperId,ColorId }
      }).then( ({ data:{ createLike={} } }) => {
        if (createLike.hasOwnProperty('id')) {
          let updates = {
            colorId: ColorId,
            family,
            likeId: createLike.id,
            doesLike: createLike.doesLike
          }
          this.updateColorStateOnFamily(updates,null,'onUpdateLike')
        } else {
            this.openError(`${errText} (error code: 1-${ShopperId}-${ColorId})`)
        }
      }).catch( e => {
        this.openError(`${errText} (error code: 2-${ShopperId}-${ColorId})`)
      })
    } else {
      this.openError(`${errText} (error code: 3-${ShopperId}-${ColorId})`)
    }
  }

  updateDoesLikeOnLikeInDb({likeId:LikeId,colorId,doesLike:bool,family}){
    let errText = 'updating the like status for this color'
    if (LikeId && colorId) {
      updates = {
        colorId,
        family,
        doesLike: !bool
      }
      this.updateColorStateOnFamily(updates,null,'onUpdateLike')
      this.props.updateDoesLikeOnLike({
        variables: {
          LikeId,
          bool: !bool
        }
      }).then( ({ data:{ updateLike={} } }) => {
        if (updateLike.hasOwnProperty('doesLike')) {
          if (updateLike.doesLike === bool) {
            updates = {
              colorId,
              family,
              doesLike: updateLike.doesLike
            }
            this.updateColorStateOnFamily(updates,null,'onUpdateLike')
            this.openError(`${errText}(1)`)
          }
        } else {
          this.openError(`${errText}(2)`)
        }
      }).catch( e => {
        this.openError(`${errText}(3)`)
      })
    } else {
      this.openError(`${errText}(4)`)
    }
  }

}

LipColors.propTypes = {
  colors: PropTypes.array.isRequired,
  shopperId: PropTypes.string.isRequired,
  distributorId: PropTypes.string.isRequired,
  distributorStatus: PropTypes.bool.isRequired,
  userType: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  colors: state.colors,
  shopperId: state.shopper.id,
  distributorId: state.distributor.id,
  distributorStatus: state.distributor.status,
  userType: state.user.type
})

const LipColorsWithData = compose(
  // inventory creator
  graphql(ConnectColorToDistributor,{
    name: 'connectColorToDistributor'
  }),
  graphql(UpdateCountOnInventory,{
    name: 'updateCountOnInventory'
  }),
  graphql(CreateLike,{
    name: 'createLike'
  }),
  graphql(UpdateDoesLikeOnLike,{
    name: 'updateDoesLikeOnLike'
  }),
  graphql(GetLikesForShopper,{
    name: 'getLikesForShopper',
    options: props => ({
      variables: {
        shopperId: { id: props.shopperId }
      },
      fetchPolicy: 'network-only'
    })
  })
)(LipColors)

export default connect(mapStateToProps)(LipColorsWithData)
