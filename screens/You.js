

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
import { compose,graphql } from 'react-apollo'
import Modal from 'react-native-modal'
import { EvilIcons,Entypo } from '@expo/vector-icons'

// GQL
import { UpdateCellPhone } from '../api/db/mutations'

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
    cellButtonColor: Colors.blue,
    isSubmitModalOpen: false
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
          <KeyboardAwareScrollView viewIsInsideTabBar={true} contentContainerStyle={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.middle,paddingVertical:40,paddingHorizontal:15}}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`}}/>
              <FontPoiret text={`${fbkFirstName} ${fbkLastName}`} size={40} vspace={vspace}/>
              {
                cellPhone ?
                <FontPoiret text={cellPhone} size={large} vspace={vspace} onPress={() => this.setState({isSubmitModalOpen:true})}/> :
                <FontPoiret text="add cell phone" size={large} vspace={vspace} onPress={() => this.setState({isSubmitModalOpen:true})}/>
              }
              {this.renderSubmitModal()}
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

  renderSubmitModal(){
    return(
      <Modal
        isVisible={this.state.isSubmitModalOpen}
        backdropColor={Colors.blue}
        backdropOpacity={0.7}>
          <View style={{...Views.middle}}>
            {this.renderNumericKeypad()}
          </View>
      </Modal>
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
      this.showModal('error','Profile','Apologies, but something prevented us from logging you out.',e.message)
    }
  }

  cellButtonDisabled = () => null

  cellButtonEnabled = () => {
    let { tempCell } = this.state
    let { id } = this.state.user
    let cellPhone = tempCell.replace(/\s/g,"")
    this.props.updateCellPhone({
      variables: {
        userId: id,
        cellPhone
      }
    }).then( res => {
      this.setState({
        cellPhone: res.data.updateUser.cellPhone,
        tempCell: '',
        cellButton: this.cellButtonDisabled,
        cellButtonColor: Colors.blue,
        cellButtonBgColor: 'transparent'
      })
    })
    .catch( e => {
      this.showModal('error','Profile','Apologies, but something prevented us from logging you out.',e.message)
    })
  }

  renderNumericKeypadCell(op,num){
    let keyPadView = {flex:1,height:50,justifyContent:'center',alignItems:'center',margin:10,borderRadius:6}
    let keypadText = {fontFamily:'Poiret',fontSize:Texts.large.fontSize}
    return (
      <TouchableHighlight
        onPress={ op === 'submit' ? this.state.cellButton : () => this.updateCellString(op,num) }
        underlayColor={ op === '+' ? Colors.blue : Colors.purpleText } style={{...keyPadView,backgroundColor: op === 'submit' ? this.state.cellButtonBgColor : op === '-' ? 'transparent' : Colors.purpleText }}>
        <Text style={{...keypadText,color: op === 'submit' ? this.state.cellButtonColor : op === '-' ? Colors.blue : Colors.purple }}>{num}</Text>
      </TouchableHighlight>
    )
  }

  renderNumericKeypad(){
    //this.state.isNumericKeyPadOpen
    let keypadWidth = this.state.screen.width-30
    return (
      <View
        style={{
          ...Views.middleNoFlex,
          width:.85*getDimensions().width,
          backgroundColor: Colors.purple,
          borderRadius: 15,
          padding: 20,
          maxHeight: 400
        }}>
        <ScrollView style={{marginTop:10}}>
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
        </ScrollView>
        <TouchableHighlight
          style={{
            width: 100,
            height: 50,
            position: 'absolute',
            bottom: -50,
            backgroundColor: Colors.purple,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            ...Views.middleNoFlex
          }}
          onPress={this.props.close}
          underlayColor={Colors.purple}>
          <Entypo name="check" size={32} color={Colors.blue} />
        </TouchableHighlight>
      </View>
    )
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
        })
      } else {
        let {cellButton} = this.state
        if (JSON.stringify(cellButton) === JSON.stringify(this.cellButtonEnabled)) {
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

export default compose(
  graphql(UpdateCellPhone,{
    name: 'updateCellPhone'
  })
)(You)
// 10000048005
