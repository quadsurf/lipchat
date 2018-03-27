

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

// COMPONENTS
import ColorCard from './ColorCard'
import ColorHeader from './ColorHeader'

// CONSTS
const { width:screenWidth } = getDimensions()
const separatorOffset = 120
const debugging = false

class LipColors extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      user: this.props.user,
      colors: [],
      isListReady: false,
      userType: this.props.userType,
      hasColors: false,
      redsIsOpen: true,
      orangesIsOpen: false,
      bluesIsOpen: false,
      purplesIsOpen: false,
      pinksIsOpen: false,
      berriesIsOpen: false,
      brownsIsOpen: false,
      neutralsIsOpen: false,
    }
    this.toggleFamilyOpenState = this.toggleFamilyOpenState.bind(this)
  }

  subToLikesInDb(){
    this.props.getLikesForShopper.subscribeToMore({
      document: SubToLikesForShopper,
      variables: {
        shopperId: { id: this.props.user.shopperx.id }
      },
      updateQuery: (previous,{ subscriptionData }) => {
        const { node={},mutation='' } = subscriptionData.data.Like
        if (mutation === 'CREATED' || mutation === 'UPDATED') {
          if (node.hasOwnProperty('id')) this.updateLikeOnColorsList(node)
        }
      }
    })
  }
  
  // NEEDS REFACTORING (perhaps by update state of single color rather than all colors???)
  updateLikeOnColorsList(node){
    let { colors } = this.state
    let i = colors.findIndex(({id}) => id === node.colorx.id)
    if (i !== -1) {
      if (colors[i].likesx.length > 0 && colors[i].likesx[0].hasOwnProperty('id')) {
        if (colors[i].likesx[0].doesLike !== node.doesLike) {
          colors[i].likesx[0].doesLike = node.doesLike
          this.setState({colors},() => this.processColors(this.state.colors))
        } else {
          this.processColors(colors)
          // THIS CAN BE PERFORMANCE OPTIMIZED BY SEPARATING OUT THE FAMILY LISTS LIKE SO:
          // let { neutralsColorIds } = this.state
          // this.setState({neutralsColorIds:[...neutralsColorIds]})
        }
      }
    }
  }
  
  componentDidMount(){
    this.subToLikesInDb()
  }
  
  componentWillReceiveProps(newProps){
    if (newProps.colors !== this.props.colors) {
      this.setState({colors:newProps.colors},()=>{
        this.processColors(this.state.colors)
      })
    }
  }

  processColors(colors){
    if (this.state.hasColors === false) {
      this.setState({hasColors:true})
      let neutralsColorIds = []
      let redsColorIds = []
      let pinksColorIds = []
      let brownsColorIds = []
      let purplesColorIds = []
      let berriesColorIds = []
      let orangesColorIds = []
      let bluesColorIds = []
      let colorIdsCatcher = []

      colors.forEach(color => {
        let { colorId,family } = color
        this.setState({
          [`${colorId}`]:{...color}
        },()=>{
          switch (family) {
            case "NEUTRALS":
              neutralsColorIds.push(colorId)
              break;
              case "REDS":
                redsColorIds.push(colorId)
                break;
                case "PINKS":
                  pinksColorIds.push(colorId)
                  break;
                  case "BROWNS":
                    brownsColorIds.push(colorId)
                    break;
                    case "PURPLES":
                      purplesColorIds.push(colorId)
                      break;
                      case "BERRIES":
                        berriesColorIds.push(colorId)
                        break;
                        case "ORANGES":
                          orangesColorIds.push(colorId)
                          break;
                          case "BLUES":
                            bluesColorIds.push(colorId)
                            break;
                        default:
                          colorIdsCatcher.push(colorId)
          }
        })
      })

      this.setState({
        neutralsColorIds,
        redsColorIds,
        pinksColorIds,
        brownsColorIds,
        purplesColorIds,
        berriesColorIds,
        orangesColorIds,
        bluesColorIds,
        colorIdsCatcher
      },()=>{
        setTimeout(()=>{
          this.setState({
            isListReady: true,
            hasColors: false
          })
        },1400)//2000
      })
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

  renderLoading(){
    return (
      <DotsLoader
        size={15}
        color={Colors.pinkly}
        frequency={5000}/>
    )
  }
  
  renderColorCards(colorIds){
    return colorIds.map(colorId => {
      let color = this.state[`${colorId}`]
      // let { id,count } = color.inventory
      return <ColorCard
        key={color.colorId} 
        family={color.family} 
        tone={color.tone} 
        name={color.name} 
        rgb={color.rgb ? `rgb(${color.rgb})` : Colors.purpleText} 
        userType={this.props.userType}
        doesLike={color.doesLike}
        onLikePress={() => this.checkIfLikeExists(color.likeId,color.colorId)}
        finish={color.finish} 
        status={color.status} 
        inventoryCount={color.count} 
        inventoryId={color.inventoryId}
        onAddPress={() => this.inventoryUpdater(color.colorId,color.count,'+')}
        onMinusPress={() => this.inventoryUpdater(color.colorId,color.count,'-')}
        isEditing={this.state[`isEditing-${color.colorId}`]}
        onCancelPress={() => this.cancelInventoryUpdater(color)}
        onUpdatePress={() => this.checkIfInventoryExists(color.inventoryId,color.colorId)}/>
    })
  }
  
  renderColorsList(colorIds,isOpen){
    if (!this.state.isListReady) {
      return this.renderLoading()
    } else {
      if (isOpen) {
        return this.renderColorCards(colorIds)
      } else {
        return <View style={{width:screenWidth}}/>
      }
    }
  }
  
  toggleFamilyOpenState(family){
    this.setState({
      [`${family}IsOpen`]: !this.state[`${family}IsOpen`]
    })
  }
  
  renderColorHeader(family){
    return (
      <ColorHeader 
        family={family}
        onPressHeader={this.toggleFamilyOpenState}
        isOpen={this.state[`${family}IsOpen`]}
        offset={separatorOffset}/>
    )
  }

  renderMainContent(){
    let {
      redsColorIds,
      orangesColorIds,
      bluesColorIds,
      purplesColorIds,
      berriesColorIds,
      pinksColorIds,
      brownsColorIds,
      neutralsColorIds,
      redsIsOpen,
      orangesIsOpen,
      bluesIsOpen,
      purplesIsOpen,
      berriesIsOpen,
      pinksIsOpen,
      brownsIsOpen,
      neutralsIsOpen,
      isListReady
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
                {isListReady ? this.renderColorsList(redsColorIds,redsIsOpen) : this.renderLoading()}
              </View>
              {this.renderColorHeader('reds')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(orangesColorIds,orangesIsOpen)}
              </View>
              {this.renderColorHeader('oranges')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(bluesColorIds,bluesIsOpen)}
              </View>
              {this.renderColorHeader('blues')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(purplesColorIds,purplesIsOpen)}
              </View>
              {this.renderColorHeader('purples')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(berriesColorIds,berriesIsOpen)}
              </View>
              {this.renderColorHeader('berries')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(pinksColorIds,pinksIsOpen)}
              </View>
              {this.renderColorHeader('pinks')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(brownsColorIds,brownsIsOpen)}
              </View>
              {this.renderColorHeader('browns')}
            </View>
            
            <View>
              <View style={{marginTop:separatorOffset}}>
                {isListReady && this.renderColorsList(neutralsColorIds,neutralsIsOpen)}
              </View>
              {this.renderColorHeader('neutrals')}
            </View>
        </ScrollView>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.purpleText}}>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  inventoryStateUpdater(colorId,count,op){
    this.setState({
      [`${colorId}`]: {
        ...this.state[`${colorId}`],
        count: op === '+' ? count+1 : count > 0 ? count-1 : 0
      }
    })
  }

  inventoryUpdater(colorId,count,op){
    if (this.state[`isEditing-${colorId}`]) {
      this.inventoryStateUpdater(colorId,count,op)
    } else {
      this.setState({
        [`isEditing-${colorId}`]:true,
        [`resetCountFor-${colorId}`]:count
      },()=>{
        this.inventoryStateUpdater(colorId,count,op)
      })
    }
  }

  cancelInventoryUpdater(color){
    this.setState({
      [`isEditing-${color.colorId}`]: false,
      [`${color.colorId}`]: {
        ...color,
        count: this.state[`resetCountFor-${color.colorId}`]
      }
    },()=>{
      this.setState({[`resetCountFor-${color.colorId}`]:null})
    })
  }

  checkIfInventoryExists(inventoryId,colorId){
    this.showModal('processing')
    let distributorId = this.state.user.distributorx.id
    let { count } = this.state[`${colorId}`]
    if (inventoryId) {
      this.updateInventoryInDb(inventoryId,colorId,count)
    } else {
      this.createInventoryInDb(distributorId,colorId,count)
    }
  }

  createInventoryInDb(distId,colorId,count){
    let errText = 'setting up inventory for this color'
    if (distId && colorId && count) {
      this.props.connectColorToDistributor({
        variables: {
          distId,
          colorId,
          count
        }
      }).then( ({ data:{ createInventory=false } }) => {
        if (createInventory) {
          let { id,count } = createInventory
          this.setState({
            [`${colorId}`]: {
              ...this.state[`${colorId}`],
              inventoryId: id,
              count
            }
          },()=>{
            setTimeout(()=>{
              this.setState({
                [`isEditing-${colorId}`]:false,
                [`resetCountFor-${colorId}`]:null
              },()=>{
                this.setState({isModalOpen:false})
              })
            },1000)
          })
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

  updateInventoryInDb(inventoryId,colorId,count){
    let errText = 'updating your inventory for this color'
    if (inventoryId && Number.isInteger(count) && count >= 0) {
      this.props.updateCountOnInventory({
        variables: { inventoryId,count }
      }).then( ({ data:{ updateInventory=false } }) => {
        if (updateInventory) {
          setTimeout(()=>{
            this.setState({
              [`isEditing-${colorId}`]:false,
              [`resetCountFor-${colorId}`]:null
            },()=>{
              this.setState({isModalOpen:false})
            })
          },1000)
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

  checkIfLikeExists(likeId,colorId){
    let shopperId = this.state.user.shopperx.id
    if (likeId) {
      this.updateDoesLikeOnLikeInDb(likeId,colorId,!this.state[`${colorId}`].doesLike)
    } else {
      this.createLikeInDb(shopperId,colorId)
    }
  }

  createLikeInDb(ShopperId,ColorId){
    let errText = 'creating a like for this color'
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: { ShopperId,ColorId }
      }).then( ({ data:{ createLike=false } }) => {
        if (createLike) {
          this.setState({
            [`${ColorId}`]: {
              ...this.state[`${ColorId}`],
              likeId: createLike.id,
              doesLike: createLike.doesLike
            }
          })
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

  updateDoesLikeOnLikeInDb(LikeId,colorId,bool){
    let errText = 'updating the like status for this color'
    if (LikeId && colorId) {
      this.setState({
        [`${colorId}`]: {
          ...this.state[`${colorId}`],
          likeId: LikeId,
          doesLike: bool
        }
      },()=>{
        this.props.updateDoesLikeOnLike({
          variables: {LikeId,bool}
        }).then( ({ data:{ updateLike=false } }) => {
          if (updateLike) {
            if (this.state[`${colorId}`].doesLike !== updateLike.doesLike) {
              this.setState({
                [`${colorId}`]: {
                  ...this.state[`${colorId}`],
                  likeId: LikeId,
                  doesLike: bool
                }
              },()=>{
                this.openError(`${errText}(1)`)
              })
            }
          } else {
            this.openError(`${errText}(2)`)
          }
        }).catch( e => {
          this.openError(`${errText}(3)`)
        })
      })
    } else {
      this.openError(`${errText}(4)`)
    }
  }

}

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
        shopperId: { id: props.user.shopperx.id }
      }
    })
  })
)(LipColors)

const mapStateToProps = state => ({ colors: state.colors })

export default connect(mapStateToProps)(LipColorsWithData)