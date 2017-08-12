

import React, { Component } from 'react'
import {
  Text,
  View,
  ScrollView
} from 'react-native'

//LIBS
import { compose,graphql } from 'react-apollo'

// GQL
import { GetColors } from '../api/db/queries'

//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret,FontMatilde } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'
import { AppName } from '../config/Defaults'

//CONSTS
//CONSTs
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
    <View style={{width:screen.width,height:160,backgroundColor:Colors.pinkly,paddingVertical:2,paddingHorizontal:4,marginVertical:10}}>
      <View style={{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
        <FontPoiret text={props.status === 'CURRENT' ? 'permanent collection' : props.status === 'LIMITEDEDITION' ? 'limited edition' : 'discontinued but still around'} size={medium} color={Colors.white}/>
      </View>
      <View style={{flex:3,...Views.middleNoFlex}}>
        <FontMatilde text="4" size={xlarge} vspace={vspace} color={Colors.white}/>
      </View>
      <View style={{flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row'}}>
        <FontPoiret text={props.tone} size={medium} color={Colors.white}/>
        <FontPoiret text={props.name.toUpperCase()} size={large} color={Colors.white}/>
        <FontPoiret text={props.finish} size={medium} color={Colors.white}/>
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
    colorsByFamily: null
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
    if (newProps && newProps.getColors && newProps.getColors.allColors) {
      if (newProps.getColors.allColors !== this.state.colors) {
        let colors = newProps.getColors.allColors
        let colorsByFamily = {
          neutrals:colors.filter(color => color.family === "NEUTRALS"),
          reds:colors.filter(color => color.family === "REDS"),
          pinks:colors.filter(color => color.family === "PINKS"),
          boldPinks:colors.filter(color => color.family === "BOLDPINKS"),
          browns:colors.filter(color => color.family === "BROWNS"),
          purples:colors.filter(color => color.family === "PURPLES"),
          berries:colors.filter(color => color.family === "BERRIES"),
          oranges:colors.filter(color => color.family === "ORANGES")
        }
        this.setState({colors,colorsByFamily},()=>{
          console.log('colors',this.state.colors[0]);
          console.log('filteredColors',this.state.colorsByFamily[0])
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

  renderMainContent(){
    return (
      <View style={{flex:1}}>
        <ScrollView
          contentContainerStyle={{marginBottom:56}}>
            {
              this.state.colors !== null ?
              this.state.colors.map(color => {
                return <ColorCard key={color.id} family={color.family} tone={color.tone} name={color.name} finish={color.finish} status={color.status}/>
              }) : <Text>Loading...</Text>
            }
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

}

export default compose(
  graphql(GetColors,{
    name: 'getColors'
  })
)(LipColors)
