

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native'

// LIBS
import { compose,graphql } from 'react-apollo'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetColorsAndInventories,GetUserType } from '../../api/db/queries'
// import { SubUserType } from '../api/db/pubsub'
import { ConnectColorToDistributor,UpdateCountOnInventory,CreateLike,UpdateDoesLikeOnLike } from '../../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import MyStatusBar from '../../common/MyStatusBar'
import { Modals,getDimensions } from '../../utils/Helpers'
import { AppName } from '../../config/Defaults'

// COMPONENTS
import { ColorCard } from '../Components'

// CONSTS
const small = Texts.small.fontSize
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()
const vspace = 10
const screenPadding = 15
const screenPaddingHorizontal =  2*screenPadding
const inventoryCreateError = 'setting up inventory for this color'
const inventoryUpdateError = 'updating your inventory for this color'
const debugging = false

class LipColors extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: null,
    isListReady: false,
    userType: this.props.user.type,
    hasColors: false
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      if (newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors) {
        if (newProps.getColorsAndInventories.allColors !== this.state.colors) {
          this.setState({colors:newProps.getColorsAndInventories.allColors},()=>{
            this.processColors(this.state.colors)
          })
        }
      }
      if (
        newProps.getUserType
        && newProps.getUserType.User
        && newProps.getUserType.User.type
      ) {
        let type = this.state.userType
        let userType = newProps.getUserType.User.type
        if (userType !== type) {
          this.setState({userType})
        }
      }
    }
  }

  // componentDidMount(){
  //   this.subToUserType()
  // }
  // 
  // subToUserType(){
  //   this.props.getUserType.subscribeToMore({
  //     document: SubUserType,
  //     variables: {UserId:this.state.user.id},
  //     updateQuery: (previous, { subscriptionData }) => {}
  //   })
  // }

  processColors(colors){
    if (this.state.hasColors === false) {
      this.setState({hasColors:true})
      let neutralsColorIds = []
      let redsColorIds = []
      let pinksColorIds = []
      let boldPinksColorIds = []
      let brownsColorIds = []
      let purplesColorIds = []
      let berriesColorIds = []
      let orangesColorIds = []
      let colorIdsCatcher = []

      colors.forEach(color => {
        this.setState({
          [`${color.id}`]:{
            ...color,
            inventory:{
              id: color.inventoriesx.length > 0 ? color.inventoriesx[0].id : null,
              count: color.inventoriesx.length > 0 ? color.inventoriesx[0].count : 0
            },
            like: {
              id: color.likesx.length > 0 ? color.likesx[0].id : null,
              doesLike: color.likesx.length > 0 ? color.likesx[0].doesLike : false
            }
          }
        },()=>{
          switch (color.family) {
            case "NEUTRALS":
              neutralsColorIds.push(color.id)
              break;
              case "REDS":
                redsColorIds.push(color.id)
                break;
                case "PINKS":
                  pinksColorIds.push(color.id)
                  break;
                  case "BOLDPINKS":
                    boldPinksColorIds.push(color.id)
                    break;
                    case "BROWNS":
                      brownsColorIds.push(color.id)
                      break;
                      case "PURPLES":
                        purplesColorIds.push(color.id)
                        break;
                        case "BERRIES":
                          berriesColorIds.push(color.id)
                          break;
                          case "ORANGES":
                            orangesColorIds.push(color.id)
                            break;
                          default:
                            colorIdsCatcher.push(color.id)
          }
        })
      })

      this.setState({
        neutralsColorIds,
        redsColorIds,
        pinksColorIds,
        boldPinksColorIds,
        brownsColorIds,
        purplesColorIds,
        berriesColorIds,
        orangesColorIds,
        colorIdsCatcher
      },()=>{
        if (debugging) {console.log('color',this.state.colors[0])}
        setTimeout(()=>{
          this.setState({isListReady:true})
        },2000)
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

  renderColorsList(colorIds){
    if (!this.state.isListReady) {
      return (
        <DotsLoader
          size={15}
          color={Colors.pink}
          frequency={5000}/>
      )
    } else {
      return colorIds.map(colorId => {
        let color = this.state[`${colorId}`]
        let { id,count } = color.inventory
        return <ColorCard
          key={color.id} family={color.family} tone={color.tone} name={color.name} rgb={color.rgb ? `rgb(${color.rgb})` : Colors.purpleText} userType={this.state.userType}
          doesLike={this.state[`${color.id}`].like.doesLike}
          onLikePress={() => this.checkIfLikeExists(color.like.id,color.id)}
          finish={color.finish} status={color.status} inventoryCount={count} inventoryId={id}
          onAddPress={() => this.inventoryUpdater(id,color.id,count,'+')}
          onMinusPress={() => this.inventoryUpdater(id,color.id,count,'-')}
          isEditing={this.state[`isEditing-${color.id}`]}
          onCancelPress={() => this.cancelInventoryUpdater(color)}
          onUpdatePress={() => this.checkIfInventoryExists(id,color.id)}/>
      })
    }
  }

  renderMainContent(){
    let {
      neutralsColorIds,
      redsColorIds,
      pinksColorIds,
      boldPinksColorIds,
      brownsColorIds,
      purplesColorIds,
      berriesColorIds,
      orangesColorIds
    } = this.state
    return (
      <View style={{flex:1}}>
        <ScrollView
          contentContainerStyle={{marginBottom:56,justifyContent:'center',alignItems:'center'}}>
            <FontPoiret text="neutrals" size={xlarge} color={Colors.blue} style={{marginTop:10,zIndex:21,backgroundColor:'transparent'}}/>
            {this.renderColorsList(neutralsColorIds)}
            <FontPoiret text="reds" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:22,backgroundColor:'transparent'}}/>
            {this.renderColorsList(redsColorIds)}
            <FontPoiret text="pinks" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:23,backgroundColor:'transparent'}}/>
            {this.renderColorsList(pinksColorIds)}
            <FontPoiret text="bold pinks" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:24,backgroundColor:'transparent'}}/>
            {this.renderColorsList(boldPinksColorIds)}
            <FontPoiret text="browns" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:25,backgroundColor:'transparent'}}/>
            {this.renderColorsList(brownsColorIds)}
            <FontPoiret text="purples" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:26,backgroundColor:'transparent'}}/>
            {this.renderColorsList(purplesColorIds)}
            <FontPoiret text="berries" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:27,backgroundColor:'transparent'}}/>
            {this.renderColorsList(berriesColorIds)}
            <FontPoiret text="oranges" size={xlarge} color={Colors.blue} style={{marginTop:30,zIndex:28,backgroundColor:'transparent'}}/>
            {this.renderColorsList(orangesColorIds)}
        </ScrollView>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.purpleText}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  inventoryStateUpdater(InventoryId,ColorId,InventoryCount,op){
    this.setState({
      [`${ColorId}`]: {
        ...this.state[`${ColorId}`],
        inventory: {
          id: InventoryId,
          count: op === '+' ? InventoryCount+1 : InventoryCount > 0 ? InventoryCount-1 : 0
        }
      }
    })
  }

  inventoryUpdater(InventoryId,ColorId,InventoryCount,op){
    if (this.state[`isEditing-${ColorId}`]) {
      this.inventoryStateUpdater(InventoryId,ColorId,InventoryCount,op)
    } else {
      this.setState({
        [`isEditing-${ColorId}`]:true,
        [`resetCountFor-${ColorId}`]:InventoryCount
      },()=>{
        this.inventoryStateUpdater(InventoryId,ColorId,InventoryCount,op)
      })
    }
  }

  cancelInventoryUpdater(color){
    this.setState({
      [`isEditing-${color.id}`]: false,
      [`${color.id}`]: {
        ...color,
        inventory: {
          id: this.state[`${color.id}`].inventory.id,
          count: this.state[`resetCountFor-${color.id}`]
        }
      }
    },()=>{
      this.setState({[`resetCountFor-${color.id}`]:null})
    })
  }

  checkIfInventoryExists(InventoryId,ColorId){
    this.showModal('processing')
    let DistributorId = this.state.user.distributorx.id
    let InventoryCount = this.state[`${ColorId}`].inventory.count
    if (InventoryId) {
      this.updateInventory(InventoryId,ColorId,InventoryCount)
    } else {
      this.createInventory(DistributorId,ColorId,InventoryCount)
    }
  }

  createInventory(DistributorId,ColorId,InventoryCount){
    if (DistributorId && ColorId && InventoryCount) {
      this.props.connectColorToDistributor({
        variables: {
          distributorxId: DistributorId,
          colorxId: ColorId,
          count: InventoryCount
        }
      }).then( res => {
        if (res && res.data && res.data.createInventory) {
          let { id,count } = res.data.createInventory
          this.setState({
            [`${ColorId}`]: {
              ...this.state[`${ColorId}`],
              inventory: {id,count}
            }
          },()=>{
            setTimeout(()=>{
              this.setState({
                [`isEditing-${ColorId}`]:false,
                [`resetCountFor-${ColorId}`]:null
              },()=>{
                this.setState({isModalOpen:false})
              })
            },1000)
          })
        } else {
          this.openError(inventoryCreateError)
        }
      }).catch( e => {
        this.openError(inventoryCreateError)
      })
    } else {
      this.openError(inventoryCreateError)
    }
  }

  updateInventory(InventoryId,ColorId,InventoryCount){
    if (InventoryId && Number.isInteger(InventoryCount) && InventoryCount >= 0) {
      this.props.updateCountOnInventory({
        variables: {InventoryId,InventoryCount}
      }).then( res => {
        if (res && res.data && res.data.updateInventory) {
          setTimeout(()=>{
            this.setState({
              [`isEditing-${ColorId}`]:false,
              [`resetCountFor-${ColorId}`]:null
            },()=>{
              this.setState({isModalOpen:false})
            })
          },1000)
        } else {
          this.openError(inventoryUpdateError)
        }
      }).catch( e => {
        this.openError(inventoryUpdateError)
      })
    } else {
      this.openError(inventoryUpdateError)
    }
  }

  checkIfLikeExists(LikeId,ColorId){
    let ShopperId = this.state.user.shopperx.id
    let bool = !this.state[`${ColorId}`].like.doesLike
    if (LikeId) {
      this.updateDoesLikeOnLike(LikeId,ColorId,bool)
    } else {
      this.createLikeInDb(ShopperId,ColorId)
    }
  }

  createLikeInDb(ShopperId,ColorId){
    let errText = 'creating a like for this color'
    if (ShopperId && ColorId) {
      this.props.createLike({
        variables: {ShopperId,ColorId}
      }).then( res => {
        if (res && res.data && res.data.createLike) {
          this.setState({
            [`${ColorId}`]: {
              ...this.state[`${ColorId}`],
              like: {
                id: res.data.createLike.id,
                doesLike: res.data.createLike.doesLike
              }
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

  updateDoesLikeOnLike(LikeId,ColorId,bool){
    let errText = 'updating the like status for this color'
    if (LikeId && ColorId) {
      this.setState({
        [`${ColorId}`]: {
          ...this.state[`${ColorId}`],
          like: {
            id: LikeId,
            doesLike: bool
          }
        }
      },()=>{
        this.props.updateDoesLikeOnLike({
          variables: {LikeId,bool}
        }).then( res => {
          if (res && res.data && res.data.updateLike) {
            if (this.state[`${ColorId}`].like.doesLike !== res.data.updateLike.doesLike) {
              this.setState({
                [`${ColorId}`]: {
                  ...this.state[`${ColorId}`],
                  like: {
                    id: LikeId,
                    doesLike: !bool
                  }
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

export default compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx ? props.user.distributorx.id : "",
        shopperxId: props.user.shopperx ? props.user.shopperx.id : ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(ConnectColorToDistributor,{
    name: 'connectColorToDistributor'
  }),
  graphql(UpdateCountOnInventory,{
    name: 'updateCountOnInventory'
  }),
  graphql(GetUserType,{
    name: 'getUserType',
    options: props => ({
      variables: {
        UserId: props.user.id || ""
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(CreateLike,{
    name: 'createLike'
  }),
  graphql(UpdateDoesLikeOnLike,{
    name: 'updateDoesLikeOnLike'
  })
)(LipColors)