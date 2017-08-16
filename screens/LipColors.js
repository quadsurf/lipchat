

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'
import { Ionicons } from '@expo/vector-icons'
import { DotsLoader } from 'react-native-indicator'

// GQL
import { GetColorsAndInventories } from '../api/db/queries'
import { ConnectColorToDistributor,UpdateCountOnInventory } from '../api/db/mutations'

//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret,FontMatilde } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'
import { AppName } from '../config/Defaults'

//CONSTS
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()
const vspace = 10
const screenPadding = 15
const screenPaddingHorizontal =  2*screenPadding
const inventoryError = 'updating your inventory'
const ColorCard = props => {
  return (
    <View style={{width:screen.width,height:170,backgroundColor:props.rgb,
        paddingBottom:4,paddingHorizontal:4}}>
      <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingBottom:20}}>
        <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
        <FontPoiret text={props.status === 'CURRENT' ? 'main collection' : props.status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
      </View>
      {
        props.distributorId ?
        <View style={{flex:1,alignItems:'center',justifyContent:'space-around',flexDirection:'row',marginTop:20}}>
          <TouchableOpacity style={{marginLeft:40}} onPress={props.onMinusPress}>
            <Ionicons name="ios-remove-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
          <FontMatilde text={props.inventoryCount} size={100} color={Colors.white}/>
          <TouchableOpacity style={{marginRight:40}} onPress={props.onAddPress}>
            <Ionicons name="ios-add-circle-outline" size={45} color={Colors.white} style={{marginHorizontal:20,marginBottom:12}}/>
          </TouchableOpacity>
        </View> : null
      }
      <View style={{...Views.middle,marginTop:20}}>
        {
          props.isEditing ?
          <Text>cancel/save</Text> :
          <FontPoiret text={props.name.toUpperCase()} size={large} color={Colors.white}/>
        }
      </View>
      <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
        <FontPoiret text={`${props.tone.toLowerCase()} tone`} size={medium} color={Colors.white}/>
        <FontPoiret text={`${props.finish.toLowerCase()} finish`} size={medium} color={Colors.white}/>
      </View>
    </View>
  )
}

class LipColors extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    colors: null,
    colorIds: [],
    colorsByFamily: null,
    isListReady: false,
    DistributorId: this.props.user.distributorx ? this.props.user.distributorx.id : null,
    inventoryCountEditingMode: false,
    resetCount: null
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
    if (newProps && newProps.getColorsAndInventories && newProps.getColorsAndInventories.allColors) {
      if (newProps.getColorsAndInventories.allColors !== this.state.colors) {
        let colors = newProps.getColorsAndInventories.allColors
        let colorIds = []
        // colors.forEach(color => {
        //   this.setState({
        //     [`${color.id}`]:{
        //       ...color,
        //       inventory:{
        //         id: color.inventoriesx.length > 0 ? color.inventoriesx[0].id : null,
        //         count: color.inventoriesx.length > 0 ? color.inventoriesx[0].count : 0
        //       }}
        //   },()=>{
        //     colorIds.push(color.id)
        //   })
        // })

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

        // let colorsByFamily = {
        //   neutrals:colors.filter(color => color.family === "NEUTRALS"),
        //   reds:colors.filter(color => color.family === "REDS"),
        //   pinks:colors.filter(color => color.family === "PINKS"),
        //   boldPinks:colors.filter(color => color.family === "BOLDPINKS"),
        //   browns:colors.filter(color => color.family === "BROWNS"),
        //   purples:colors.filter(color => color.family === "PURPLES"),
        //   berries:colors.filter(color => color.family === "BERRIES"),
        //   oranges:colors.filter(color => color.family === "ORANGES")
        // }
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
          onAddPress={() => this.temporaryInventoryUpdater(id,color.id,count,'+')}
          onMinusPress={() => this.temporaryInventoryUpdater(id,color.id,count,'-')}
          isEditing={this.state[`isEditing-${color.id}`]}/>
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

  temporaryInventoryUpdater(InventoryId,ColorId,InventoryCount,op){
    if (this.state[`isEditing-${ColorId}`]) {
      this.setState({
        [`${ColorId}`]: {
          ...this.state[`${ColorId}`],
          inventory: {
            id: InventoryId,
            count: op === '+' ? InventoryCount+1 : InventoryCount > 0 ? InventoryCount-1 : 0
          }
        }
      })
    } else {
      this.setState({
        [`isEditing-${ColorId}`]:true,
        [`resetCountFor-${ColorId}`]:InventoryCount
      },()=>{
        console.log(`resetCountFor-${ColorId}`,this.state[`resetCountFor-${ColorId}`]);
        console.log(`isEditing-${ColorId}`,this.state[`isEditing-${ColorId}`]);
        this.setState({
          [`${ColorId}`]: {
            ...this.state[`${ColorId}`],
            inventory: {
              id: InventoryId,
              count: op === '+' ? InventoryCount+1 : InventoryCount > 0 ? InventoryCount-1 : 0
            }
          }
        })
      })
    }
  }

  checkIfInventoryExists(InventoryId,ColorId,InventoryCount,op){
    this.showModal('processing')
    let { DistributorId } = this.state
    if (InventoryId) {
      this.updateInventory(InventoryId,InventoryCount,op)
    } else {
      this.createInventory(DistributorId,ColorId)
    }
  }

  createInventory(DistributorId,ColorId){
    if (DistributorId && ColorId) {
      this.props.connectColorToDistributor({
        variables: {
          distributorxId: DistributorId,
          colorxId: ColorId,
          count: 1
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
              this.setState({isModalOpen:false})
            },1000)
          })
        } else {
          this.openError(inventoryError)
        }
      }).catch( e => {
        this.openError(inventoryError)
      })
    } else {
      this.openError(inventoryError)
    }
  }

  updateInventory(InventoryId,InventoryCount,op){
    if (InventoryId && InventoryCount && op) {
      this.props.updateCountOnInventory({
        variables: {
          InventoryId,
          InventoryCount: op === '+' ? InventoryCount+1 : InventoryCount-1
        }
      }).then( res => {
        if (res && res.data && res.data.updateInventory) {
          let { id,count } = res.data.updateInventory
          this.setState({
            [`${InventoryId}`]: {
              ...this.state[`${InventoryId}`],
              inventory: {id,count}
            }
          },()=>{
            setTimeout(()=>{
              this.setState({isModalOpen:false})
            },1000)
          })
        } else {
          this.openError(inventoryError)
        }
      }).catch( e => {
        this.openError(inventoryError)
      })
    } else {
      this.openError(inventoryError)
    }
  }

}

export default compose(
  graphql(GetColorsAndInventories,{
    name: 'getColorsAndInventories',
    options: props => ({
      variables: {
        distributorxId: props.user.distributorx ? props.user.distributorx.id : null
      },
      // fetchPolicy: 'network-only'
    })
  }),
  graphql(ConnectColorToDistributor,{
    name: 'connectColorToDistributor'
  }),
  graphql(UpdateCountOnInventory,{
    name: 'updateCountOnInventory'
  })
)(LipColors)
