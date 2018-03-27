

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
      redsIsLoading: false,
      orangesIsLoading: false,
      bluesIsLoading: false,
      purplesIsLoading: false,
      pinksIsLoading: false,
      berriesIsLoading: false,
      brownsIsLoading: false,
      neutralsIsLoading: false
    }
    this.toggleFamilyOpenState = this.toggleFamilyOpenState.bind(this)
    this.filterColors = debounce(this.filterColors,1400,true)
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
    let i = colors.findIndex(({colorId}) => colorId === node.colorx.id)
    if (i !== -1) {
      if (colors[i].doesLike !== node.doesLike) {
        colors[i].likeId = node.id
        colors[i].doesLike = node.doesLike
        this.setState({colors},() => this.processColors(this.state.colors))
      } else {
        this.processColors(colors)
      }
    }
  }
  
  componentDidMount(){
    this.subToLikesInDb()
  }
  
  componentWillReceiveProps(newProps){
    if (newProps.colors !== this.props.colors) {
      if (newProps.colors !== this.state.colors) {
        this.setState({colors:newProps.colors},()=>{
          this.filterColors('reds')
        })
      }
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

  filterColors(fam){
    let filteredColors = this.state.colors.filter(({family}) => family === fam)
    this.setState({[`${fam}`]:filteredColors},()=>{
      this.toggleFamilyOpenState(fam)
    })
  }
  
  renderColors(colors){
    return colors.map(color => {
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
        onAddPress={() => this.inventoryUpdater(color.family,color.colorId,color.count,'+')}
        onMinusPress={() => this.inventoryUpdater(color.family,color.colorId,color.count,'-')}
        isEditing={this.state[`isEditing-${color.colorId}`]}
        onCancelPress={() => this.cancelInventoryUpdater(color)}
        onUpdatePress={() => this.checkIfInventoryExists(color.inventoryId,color.colorId)}/>
    })
  }
  
  toggleFamilyOpenState(family){
    let isOpen = this.state[`${family}IsOpen`]
    if (!isOpen) {
      if (this.state[`${family}`].length === 0) {
        this.filterColors(family)
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
      isListReady,
      reds,
      oranges,
      blues,
      purples,
      berries,
      pinks,
      browns,
      neutrals,
      redsIsLoading,
      orangesIsLoading,
      bluesIsLoading,
      purplesIsLoading,
      berriesIsLoading,
      pinksIsLoading,
      brownsIsLoading,
      neutralsIsLoading
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
      <View style={{...Views.middle,backgroundColor:Colors.purpleText}}>
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  updateCountState(family,cId,count,op){
    let colors = this.state[`${family}`]
    let i = colors.findIndex(({colorId}) => colorId === cId)
    if (i !== 1) {
      let color = {
        ...colors[i],
        count: op === '+' ? count+1 : op === '-' ? count-1 : count
      }
      colors.splice(i,1,color)
      this.setState({colors})
    }
  }
  
  inventoryStateUpdater(family,cId,count,op){
    if (op === '-' && count < 1) {
    } else {
      this.updateCountState(family,cId,count,op)
    }
  }

  inventoryUpdater(family,colorId,count,op){
    if (this.state[`isEditing-${colorId}`]) {
      this.inventoryStateUpdater(family,colorId,count,op)
    } else {
      this.setState({
        [`isEditing-${colorId}`]:true,
        [`resetCountFor-${colorId}`]:count
      },()=>{
        this.inventoryStateUpdater(family,colorId,count,op)
      })
    }
  }

  cancelInventoryUpdater(color){
    this.updateCountState(
      color.family,
      color.colorId,
      this.state[`resetCountFor-${color.colorId}`]
    )
    this.setState({
      [`isEditing-${color.colorId}`]: false
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