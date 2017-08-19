

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
import { GetColorsAndInventories,GetDistributorId } from '../api/db/queries'
import { ConnectColorToDistributor,UpdateCountOnInventory } from '../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'
import { AppName } from '../config/Defaults'

// COMPONENTS
import ColorCard from './components/ColorCard'

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

class LipColors extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: null,
    isListReady: false,
    DistributorId: this.props.user.distributorx ? this.props.user.distributorx.id : null,
    newPropsAllColorsCount: 0
  }

  shouldComponentUpdate(nextProps,nextState){
    if (this.props !== nextProps) {
      return true
    }
    if (this.state !== nextState) {
      return true
    }
    return false
  }

  componentWillReceiveProps(newProps){
    if (
      newProps && newProps.getDistributorId
      && Array.isArray(newProps.getDistributorId.allDistributors)
    ) {
      if (newProps.getDistributorId.allDistributors.length > 0) {
        if (this.state.DistributorId === null) {
          this.showModal('processing')
          this.clearInventoryCounts(1)
          setTimeout(()=>{
            this.setState({
              DistributorId:newProps.getDistributorId.allDistributors[0].id
            },()=>{
              this.setState({isModalOpen:false})
            })
          },2000)
        }
      } else {
        if (this.state.DistributorId) {
          this.showModal('processing')
          this.setState({DistributorId:null},()=>{
            this.clearInventoryCounts(2)
          })
        }
      }
    }

    if (
      newProps && newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors
    ) {
      this.setState({
        newPropsAllColorsCount:this.state.newPropsAllColorsCount+1
      },()=>{
        if (this.state.newPropsAllColorsCount < 2) {
          this.processColors(newProps.getColorsAndInventories.allColors)
        }
      })
    }
  }

  processColors(colors){
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
          }}
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
      colors,
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
      setTimeout(()=>{
        this.setState({isListReady:true});
      },2000)
    })
  }

  clearInventoryCounts(opt){
    this.state.colors.forEach(color => {
      if (
        this.state[`${color.id}`].inventory.count > 0
        || this.state[`isEditing-${color.id}`] === true
        || this.state[`resetCountFor-${color.id}`] !== null
      ) {
        this.setState({
          [`isEditing-${color.id}`]: false,
          [`${color.id}`]: {
            ...this.state[`${color.id}`],
            inventory: {
              id: null,
              count: 0
            }
          }
        },()=>{
          this.setState({[`resetCountFor-${color.id}`]:null})
        })
      }
    })
    if (opt === 2) {
      this.setState({isModalOpen:false})
    }
  }

  // if modalType='error', then pass at least the first 3 params below
  // if modalType='processing', then pass only modalType
  // if modalType='prompt', then pass TBD
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
    let { DistributorId } = this.state
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
          key={color.id} family={color.family} tone={color.tone} name={color.name} rgb={color.rgb ? `rgb(${color.rgb})` : Colors.purpleText} distributorId={DistributorId}
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
      orangesColorIds,
      DistributorId
    } = this.state
    return (
      <View style={{flex:1}}>
        <ScrollView
          contentContainerStyle={{marginBottom:56,justifyContent:'center',alignItems:'center'}}>
            <FontPoiret text="neutrals" size={xlarge} color={Colors.blue} style={{marginTop:10}}/>
            {this.renderColorsList(neutralsColorIds)}
            <FontPoiret text="reds" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(redsColorIds)}
            <FontPoiret text="pinks" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(pinksColorIds)}
            <FontPoiret text="bold pinks" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(boldPinksColorIds)}
            <FontPoiret text="browns" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(brownsColorIds)}
            <FontPoiret text="purples" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(purplesColorIds)}
            <FontPoiret text="berries" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
            {this.renderColorsList(berriesColorIds)}
            <FontPoiret text="oranges" size={xlarge} color={Colors.blue} style={{marginTop:40}}/>
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
    let { DistributorId } = this.state
    let InventoryCount = this.state[`${ColorId}`].inventory.count
    if (InventoryId) {
      this.updateInventory(InventoryId,ColorId,InventoryCount)
      // this.openError(`${InventoryId} | ${ColorId} | ${InventoryCount}`)
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

}

export default compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx ? props.user.distributorx.id : null
      }
    })
  }),
  graphql(ConnectColorToDistributor,{
    name: 'connectColorToDistributor'
  }),
  graphql(UpdateCountOnInventory,{
    name: 'updateCountOnInventory'
  }),
  graphql(GetDistributorId,{
    name: 'getDistributorId',
    options: props => ({
      pollInterval: 10000,
      variables: {
        userx: {"id":props.user.id}
      },
      fetchPolicy: 'network-only'
    })
  })
)(LipColors)
