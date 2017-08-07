

import React, { Component } from 'react'
import {
  Text,
  View,
  AsyncStorage,
  Image,
  ScrollView,
  TextInput,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native'

//LIBS
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { compose,graphql } from 'react-apollo'
import Modal from 'react-native-modal'
import { EvilIcons,MaterialCommunityIcons } from '@expo/vector-icons'

// GQL
import { UpdateCellPhone,UpdateName } from '../api/db/mutations'

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
    name: `${this.props.user.fbkFirstName || 'firstName'} ${this.props.user.fbkLastName || 'lastName'}`,
    userType: this.props.user.type,
    screen: getDimensions(),
    large: Texts.large.fontSize,
    isNumericKeyPadOpen: false,
    isUserTypeSubmitModalOpen: false,
    cellButton: this.cellButtonDisabled,
    cellButtonBgColor: 'transparent',
    cellButtonColor: Colors.blue,
    isCellSubmitModalOpen: false
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
    let screenPadding = 15
    let screenPaddingHorizontal =  2*screenPadding
    let { large } = this.state
    let { fbkFirstName,fbkLastName,fbkUserId } = this.state.user
    let textInputStyle = {fontFamily:'Poiret',backgroundColor:'transparent',fontSize:large,color:Colors.blue,height:32}
    let textInputStyleLarge = {
      fontFamily:'Poiret',backgroundColor:'transparent',fontSize:40,color:Colors.blue,
      height:100,width:this.state.screen.width-screenPaddingHorizontal,textAlign:'center'
    }
    return (
        <View style={{...Views.middle}}>
          <KeyboardAwareScrollView viewIsInsideTabBar={true} contentContainerStyle={{width:getDimensions().width,height:getDimensions().height}}>
            <View style={{...Views.middle,paddingVertical:40,paddingHorizontal:screenPadding}}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`}}/>
              <TextInput value={this.state.name} placeholder="add your full name" style={textInputStyleLarge}
                onChangeText={(name) => name.length > 0 ? this.setState({name}) : null}
                keyboardType="default"
                onSubmitEditing={() => this.updateNameInDb()}
                blurOnSubmit={true}
                returnKeyType="send"/>
              {this.renderUserType()}
              {this.renderCellPhone()}
              {this.renderCellSubmitModal()}
              <FontPoiret text="logout" size={large} vspace={vspace} onPress={() => this.logOut()}/>
            </View>
          </KeyboardAwareScrollView>
        </View>
    )
  }

  renderUserType(){
    let { large } = this.state
    let { type } = this.state.user
    return (
      <TouchableOpacity onPress={() => this.showModal()} style={{flexDirection:'row'}}>
        <FontPoiret text="shopper" size={large}/>
        <MaterialCommunityIcons name={this.state.userType === "DIST" ? 'ray-start-arrow' : 'ray-end-arrow' } color={Colors.purpleText} size={40} style={{marginHorizontal:10}}/>
        <FontPoiret text="distributor" size={large}/>
      </TouchableOpacity>
    )
  }

  updateUserTypeInDb(){
    let { id } = this.state.user.id
    let type
    if (this.state.userType === "DIST") {
      type = 'SHOPPER'
    } else {
      type = 'DIST'
    }
    this.props.updateUserType({
      variables: {
        userId: id,
        type
      }
    }).then().catch()
  }

  renderCellPhone(){
    let { cellPhone } = this.state
    let vspace = 20
    let large = Texts.large.fontSize
    if (cellPhone) {
      return <FontPoiret text={cellPhone} size={large} vspace={vspace} onPress={() => this.setState({isCellSubmitModalOpen:true})}/>
    } else {
      return <FontPoiret text="add cell phone" size={large} vspace={vspace} onPress={() => this.setState({isCellSubmitModalOpen:true})}/>
    }
  }

  renderCellSubmitModal(){
    return(
      <Modal
        isVisible={this.state.isCellSubmitModalOpen}
        backdropColor={Colors.blue}
        backdropOpacity={0.7}>
          <View style={{...Views.middle}}>
            {this.renderNumericKeypad()}
          </View>
      </Modal>
    )
  }

  renderUserTypeSubmitModal(){
    return(
      <Modal
        isVisible={this.state.isUserTypeSubmitModalOpen}
        backdropColor={Colors.blue}
        backdropOpacity={0.7}>
          <View style={{...Views.middle}}>
            {this.renderUserTypeContent()}
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

  updateNameInDb(){
    let { name } = this.state
    let trimmedName = name.trim()
    let nameArray = trimmedName.split(' ')
    if (nameArray.length > 0 && nameArray.length < 3) {
      let fbkFirstName,fbkLastName
      if (nameArray.length === 2) {
        fbkFirstName = nameArray[0]
        fbkLastName = nameArray[1]
      } else {
        fbkFirstName = nameArray[0]
        fbkLastName = ''
      }
      this.props.updateName({
        variables: {
          userId: this.state.user.id,
          fbkFirstName,fbkLastName
        }
      }).then( res => {
        if (res) {
          let { fbkFirstName,fbkLastName } = res.data.updateUser
          this.setState({
            name: `${fbkFirstName} ${fbkLastName}`,
            user: {
              ...this.state.user,
              fbkFirstName,fbkLastName
            }
          })
        } else {
          this.showModal('error','Profile','Apologies, but something prevented us from updating your name. We were notified of this error, and will be working on a fix for it.')
        }
      }).catch( e => {
        this.showModal('error','Profile','Apologies, but something prevented us from updating your name. We were notified of this error, and will be working on a fix for it.')
      })
    } else {
      this.showModal('prompt','about that name...','First name and last name only please, or just use one name if you prefer.')
    }
  }

  cellButtonDisabled = () => null

  cellButtonEnabled = () => {
    this.showModal('processing')
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
        user: {
          ...this.state.user,
          cellPhone: res.data.updateUser.cellPhone
        },
        tempCell: '',
        cellButton: this.cellButtonDisabled,
        cellButtonColor: Colors.blue,
        cellButtonBgColor: 'transparent',
        isCellSubmitModalOpen:false
      })
    })
    .catch( e => {
      this.showModal('error','Profile','Apologies, but something prevented us from updating your cell phone. We were notified of this error, and will be working on a fix for it.')
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
    return (
      <View
        style={{
          ...Views.middleNoFlex,
          width:.85*this.state.screen.width,
          backgroundColor: Colors.purple,
          borderRadius: 15,
          padding: 20,
          maxHeight: 400
        }}>
            <View style={{...Views.middle,height:50,paddingVertical:30}}>
              <FontPoiret text={this.state.tempCell || '( _ _ _ ) _ _ _ - _ _ _ _'} size={30}/>
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
          onPress={() => this.setState({isCellSubmitModalOpen:false})}
          underlayColor={Colors.purple}>
          <EvilIcons name="close" size={32} color={Colors.blue} />
        </TouchableHighlight>
      </View>
    )
  }

  renderUserTypeContent(){
    return (
      <View
        style={{
          ...Views.middleNoFlex,
          width:.85*this.state.screen.width,
          backgroundColor: Colors.purple,
          borderRadius: 15,
          padding: 20,
          maxHeight: 400
        }}>
          <FontPoiret text="about that account type..." size={Texts.large.fontSize} color={Colors.blue}/>
          <ScrollView style={{marginTop:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              SHOPPERS{`\n`}
              With a distributor account, you can manage your customers with tools like inventory tracking, chat, and lite order tracking. You can provide your customers (and prospective customers too) with your distributor ID so that when they use {AppName} and express interest in a lip color, only you will be able to engage them in chat, or place a direct phone call to them via the app to help convert lip color interest, into a completed sale!
            </Text>
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
          onPress={() => this.setState({isCellSubmitModalOpen:false})}
          underlayColor={Colors.purple}>
          <EvilIcons name="close" size={32} color={Colors.blue} />
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

}

export default compose(
  graphql(UpdateCellPhone,{
    name: 'updateCellPhone'
  }),
  graphql(UpdateName,{
    name: 'updateName'
  })
)(You)
// 10000048005
