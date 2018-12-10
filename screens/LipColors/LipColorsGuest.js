

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
import { GetColors } from './../../api/db/queries'

// LOCALS
import { Views,Colors } from '../../css/Styles'
import { Modals } from '../../utils/Helpers'

// COMPONENTS
import ColorCard from './ColorCard'
import ColorHeader from './ColorHeader'

// CONSTS
const duration = 2000
const separatorOffset = 120
const debugging = __DEV__ && false

class LipColorsGuest extends Component {

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

    this.handleReds = debounce(this.handleReds,duration,true)
    this.toggleFamilyOpenState = this.toggleFamilyOpenState.bind(this)
    this.checkIfLikeExists = debounce(this.checkIfLikeExists.bind(this),duration,true)
  }

  // componentWillMount(){
  //   let { colors } = this.props
  //   if (colors.length > 0) {
  //     this.setState({colors},()=>{
  //        this.handleReds()
  //     })
  //   }
  // }

  componentDidMount(){
    this.handleReds()
  }

  // componentWillReceiveProps(newProps){
  //   if (newProps.colors !== this.props.colors) {
  //     if (newProps.colors !== this.state.colors) {
  //       this.setState({colors:newProps.colors},()=>{
  //         this.handleReds()
  //       })
  //     }
  //   }
  // }

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
        console.log('about to call filterColors func')
        this.filterColors('reds','handleReds')
      }
    })
  }

  filterColors(fam,cameFrom){
    console.log('colors on props',this.props.colors[0])
    let filteredColors = this.props.colors.filter(({family}) => family === fam)
    this.setState({[`${fam}`]:filteredColors},()=>{
      this.toggleFamilyOpenState(fam)
    })
  }

  renderColors(colors){
    return colors.map(color => {
      return <ColorCard
        key={color.colorId}
        color={color}
        userType="SHOPPER"
        onLikePress={this.checkIfLikeExists}/>
    })
  }

  toggleFamilyOpenState(family){
    // console.log(this.props.colors)
    // return
    if (this.props.colors.length > 0) {
      let isOpen = this.state[`${family}IsOpen`]
      if (!isOpen) {
        if (this.state[`${family}`].length === 0) {
          this.filterColors(family,'toggleFamilyOpenState')
        } else {
          this.setState({[`${family}IsOpen`]:!isOpen})
        }
      } else {
        this.setState({[`${family}IsOpen`]:!isOpen})
      }
    } else {
      this.showModal(
        'prompt',
        'Issue Loading Colors',
        `Apologies, but we could't load these colors.

        Please try reloading this tab.`
      )
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
    let { screenWidth:width } = this.props.settings
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
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('reds')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  orangesIsOpen && oranges.length > 0
                    ? this.renderColors(oranges)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('oranges')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  bluesIsOpen && blues.length > 0
                    ? this.renderColors(blues)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('blues')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  purplesIsOpen && purples.length > 0
                    ? this.renderColors(purples)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('purples')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  berriesIsOpen && berries.length > 0
                    ? this.renderColors(berries)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('berries')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  pinksIsOpen && pinks.length > 0
                    ? this.renderColors(pinks)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('pinks')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  brownsIsOpen && browns.length > 0
                    ? this.renderColors(browns)
                    : <View style={{width}}/>
                }
              </View>
              {this.renderColorHeader('browns')}
            </View>

            <View>
              <View style={{marginTop:separatorOffset}}>
                {
                  neutralsIsOpen && neutrals.length > 0
                    ? this.renderColors(neutrals)
                    : <View style={{width}}/>
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

  checkIfLikeExists(){
    console.log('checkIfLikeExists func called')
  }

}

LipColorsGuest.propTypes = {
  colors: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  colors: state.colors,
  settings: state.settings
})

// const LipColorsGuestWithData = compose(
//   graphql(GetColors,{
//     name: 'colors',
//     options: () => ({
//       fetchPolicy: 'network-only'
//     })
//   })
// )(LipColorsGuest)

export default connect(mapStateToProps)(LipColorsGuest)
