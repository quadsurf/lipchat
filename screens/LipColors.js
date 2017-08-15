

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'

// GQL
import { GetColorsAndInventories } from '../api/db/queries'
import { ConnectColorToDistributor } from '../api/db/mutations'

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
const ColorCard = props => {
  return (
    <View style={{width:screen.width,height:160,backgroundColor:props.rgb,
        paddingBottom:4,paddingHorizontal:4}}>
      <View style={{flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
        <FontPoiret text={props.rgb === Colors.purpleText ? 'could not load proper color' : ''} size={medium} color={Colors.white}/>
        <FontPoiret text={props.status === 'CURRENT' ? 'permanent collection' : props.status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
      </View>
      <TouchableOpacity style={{flex:3,alignItems:'center',justifyContent:'space-between',flexDirection:'row',marginTop:20}} onPress={props.onPress}>
        <FontPoiret text={props.tone} size={medium} color={Colors.white}/>
        <FontMatilde text={props.inventoryCount} size={xlarge} color={Colors.white}/>
        <FontPoiret text={props.finish} size={medium} color={Colors.white}/>
      </TouchableOpacity>
      <View style={{...Views.middle}}>
        <FontPoiret text={props.name.toUpperCase()} size={large} color={Colors.white}/>
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
    shades: [],
    colorsByFamily: null,
    isListReady: false,
    DistributorId: this.props.user.distributorx ? this.props.user.distributorx.id : null
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
        let shades = []
        colors.forEach(color => {
          this.setState({
            [`${color.id}`]:{
              ...color,
              inventory:{
                id: color.inventoriesx.length > 0 ? color.inventoriesx[0].id : null,
                count: color.inventoriesx.length > 0 ? color.inventoriesx[0].count : 0
              }}
          },()=>{
            shades.push(color.id)
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
        this.setState({shades,colors},()=>{
          this.setState({isListReady:true},()=>{
            console.log('test: ',this.state[`${this.state.shades[0]}`]);
          })
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

  renderColorsList(){
    if (!this.state.isListReady) {
      return (
        <Text>Loading...</Text>
      )
    } else {
      return this.state.shades.map(colorId => {
        let color = this.state[`${colorId}`]
        return <ColorCard key={color.id} family={color.family} tone={color.tone} name={color.name} rgb={color.rgb ? `rgb(${color.rgb})` : Colors.purpleText} finish={color.finish} status={color.status} inventoryCount={color.inventory.count} inventoryId={color.inventory.id} onPress={() => this.updateColor(color.id)}/>
      })
    }
  }

  updateColor(id){
    this.setState({[`${id}`]:{...this.state[`${id}`],count:this.state[`${id}`].count+1}})
  }

  renderMainContent(){
    return (
      <View style={{flex:1}}>
        <ScrollView
          contentContainerStyle={{marginBottom:56}}>
            {this.renderColorsList()}
        </ScrollView>
      </View>
    )
  }

  render(){
    return(
      <View style={{...Views.middle,backgroundColor:Colors.bgColor}}>
        <MyStatusBar hidden={false} />
        {this.renderMainContent()}
        {this.renderModal()}
      </View>
    )
  }

  checkIfInventoryExists(InventoryId,ColorId){
    let { DistributorId } = this.state
    if (InventoryId) {
      this.updateInventory(InventoryId,InventoryCount)
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
          })
        } else {
          this.showModal('err','Lip Colors','updating your inventory')
        }
      }).catch( e => {
        this.showModal('err','Lip Colors','updating your inventory')
      })
    }
  }

  updateInventory(){

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
  })
)(LipColors)
