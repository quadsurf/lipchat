

import React, { Component } from 'react'
import {
  Text,
  View,
  AsyncStorage,
  Image,
  ScrollView,
  TextInput,
  TouchableHighlight
} from 'react-native'

//LIBS
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'

class You extends Component {

  state = {
    isModalOpen: false,
    modalType: 'processing',
    modalContent: {},
    user: this.props.user,
    cellPhone: this.props.user.cellPhone,
    tempCell: '',
    screen: getDimensions(),
    text: 'go pro now',
    isNumericKeyPadOpen: false,
    cellButton: this.cellButtonDisabled,
    cellButtonBgColor: 'transparent',
    cellButtonColor: Colors.blue
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

  // if modalType='error', then pass at least the first 3 params below
  // if modalType='processing', then pass only modalType
  // if modalType='prompt', then pass TBD
  showModal(modalType,title,description,message=''){
    if (this.state.isModalOpen) {
      this.setState({isModalOpen:false},()=>{
        setTimeout(()=>{
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
        },600)
      })
    } else {
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
    let imageWidth = 280
    let vspace = 20
    let large = Texts.large.fontSize
    let { fbkFirstName,fbkLastName,fbkUserId } = this.state.user
    let { cellPhone } = this.state
    let textInputStyle = {fontFamily:'Poiret',backgroundColor:'transparent',fontSize:large,color:Colors.blue,height:32}
    return (
        <View style={{...Views.middle}}>
          <KeyboardAwareScrollView contentContainerStyle={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.middle,paddingVertical:40,paddingHorizontal:15}}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`}}/>
              <FontPoiret text={`${fbkFirstName} ${fbkLastName}`} size={40} vspace={vspace}/>
              {
                cellPhone ?
                <FontPoiret text={cellPhone} size={large} vspace={vspace} onPress={() => this.updateCellPhone()}/> :
                <FontPoiret text="add cell phone" size={large} vspace={vspace} onPress={() => this.updateCellPhone()}/>
              }
              {this.renderNumericKeypad()}
              <FontPoiret text="logout" size={large} vspace={vspace} onPress={() => this.logOut()}/>
              <TextInput value={this.state.text} placeholder={this.state.text} style={textInputStyle}
                onChangeText={(text) => this.setState({text})}
                keyboardType="default"
                onSubmitEditing={() => this.updateCellPhone()}
                selectTextOnFocus={true}
                returnKeyType="done"/>
            </View>
          </KeyboardAwareScrollView>
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

  async logOut(){
    try {
      this.showModal('processing')
      AsyncStorage.multiRemove(['fbkToken','gcToken','userId'], (e) => {
        if (e) {
          //
        } else {
          setTimeout(()=>{
            this.setState({ isModalOpen:false },()=>{
              this.props.nav.navigate('LoggedOut')
            })
          },2000)
        }
      })
    } catch(e) {
      this.setState({ isModalOpen:false },()=>{
        this.showModal('error','Profile','Apologies, but something prevented us from logging you out.',e.message)
      })
    }
  }

  cellButtonDisabled = () => {
    console.log('cellButtonDisabled func');
  }

  cellButtonEnabled = () => {
    console.log('cellButtonEnabled func, ready to updateCellInDb');
  }

  renderNumericKeypadCell(op,num){
    if (op === 'submit') {
      return (
        <TouchableHighlight
          onPress={this.state.cellButton}
          underlayColor={Colors.blue}  style={{flex:1,height:50,justifyContent:'center',alignItems:'center',backgroundColor:this.state.cellButtonBgColor,margin:10,borderRadius:6}}>
          <Text style={{fontFamily:'Poiret',fontSize:Texts.large.fontSize,color:this.state.cellButtonColor}}>{num}</Text>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight
          onPress={() => this.updateCellString(op,num)}
          underlayColor={Colors.blue}  style={{flex:1,height:50,justifyContent:'center',alignItems:'center',backgroundColor:Colors.purpleText,margin:10,borderRadius:6}}>
          <Text style={{fontFamily:'Poiret',fontSize:Texts.large.fontSize,color:Colors.purple}}>{num}</Text>
        </TouchableHighlight>
      )
    }
  }

  renderNumericKeypad(){
    if (this.state.isNumericKeyPadOpen) {
      let keypadWidth = this.state.screen.width-30
      // let keypadCell = keypadWidth*.333
      let tempCell = this.state.tempCell || this.state.cellPhone
      return (
        <View style={{width:keypadWidth,backgroundColor:Colors.purple}}>
          <View style={{...Views.middle,height:50,paddingVertical:30}}>
            <FontPoiret text={this.state.tempCell || '- -'} size={30}/>
          </View>
          <View style={{flexDirection:'row'}}>
            {this.renderNumericKeypadCell('+','1')}
            {this.renderNumericKeypadCell('+','2')}
            {this.renderNumericKeypadCell('+','3')}
          </View>
          <View style={{flexDirection:'row'}}>
            {this.renderNumericKeypadCell('+','4')}
            {this.renderNumericKeypadCell('+','5')}
            {this.renderNumericKeypadCell('+','6')}
          </View>
          <View style={{flexDirection:'row'}}>
            {this.renderNumericKeypadCell('+','7')}
            {this.renderNumericKeypadCell('+','8')}
            {this.renderNumericKeypadCell('+','9')}
          </View>
          <View style={{flexDirection:'row'}}>
            {this.renderNumericKeypadCell('-','del')}
            {this.renderNumericKeypadCell('+','0')}
            {this.renderNumericKeypadCell('submit','save')}
          </View>
        </View>
      )
    } else {
      return null
    }
  }

  updateCellString(op,num){
    let cellString = this.state.tempCell
    let cellArray = cellString.split('')
    if (cellArray.length < 17) {
      let tempCell
      if (op === '+') {
        if (cellArray.length === 3 || cellArray.length === 9) {
          if (cellArray.length < 16) {
            cellArray.push(` - ${num}`)
          }
        } else {
          if (cellArray.length < 16) {
            cellArray.push(num)
          }
        }
        tempCell = cellArray.join('')
      } else if (op === '-') {
        let shortenedCellArray = cellArray
        let shorterCellArray
        if (shortenedCellArray.length === 7 || shortenedCellArray.length === 13) {
          shorterCellArray = shortenedCellArray.slice(0,-4)
        } else {
          shorterCellArray = shortenedCellArray.slice(0,-1)
        }
        tempCell = shorterCellArray.join('')
      }
      if (tempCell.length >= 16) {
        this.setState({
          tempCell,
          cellButton:this.cellButtonEnabled,
          cellButtonColor: Colors.purple,
          cellButtonBgColor: Colors.blue
        },()=>{
          console.log('cellButton');
          console.log(typeof this.state.cellButton);
          console.log(this.state.cellButton);
        })
      } else {
        let {cellButton} = this.state
        if (JSON.stringify(cellButton) === JSON.stringify(this.cellButtonEnabled)) {
          console.log('<16 and buttons are equal');
          this.setState({
            tempCell,
            cellButton: this.cellButtonDisabled,
            cellButtonColor: Colors.blue,
            cellButtonBgColor: 'transparent'
          })
        } else {
          this.setState({tempCell})
        }
      }
    }
  }

  updateCellPhone(){
    if (!this.state.isNumericKeyPadOpen) {
      this.setState({isNumericKeyPadOpen:true})
    } else {
      this.setState({isNumericKeyPadOpen:false})
    }
  }

}

export default You
// 10000048005
