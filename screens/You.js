

// refactoring to-dos: centralize button styling, disable submit buttons onPress with spinning loader, error handling, url tester

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
import { MKSwitch } from 'react-native-material-kit'
import Modal from 'react-native-modal'
import { EvilIcons } from '@expo/vector-icons'

// GQL
import {
  UpdateCellPhone,UpdateName,UpdateUserType,
  CreateDistributor,DeleteDistributor,
  UpdateDistributorDistId,UpdateDistributorBizName,UpdateDistributorBizUri,UpdateDistributorLogoUri
} from '../api/db/mutations'

//LOCALS
import { Views,Colors,Texts } from '../css/Styles'
import { FontPoiret } from '../assets/fonts/Fonts'
import MyStatusBar from '../common/MyStatusBar'
import { err,Modals,getDimensions } from '../utils/Helpers'
import { AppName } from '../config/Defaults'

//CONSTs
const medium = Texts.medium.fontSize
const large = Texts.large.fontSize
const larger = Texts.larger.fontSize
const xlarge = Texts.xlarge.fontSize
const screen = getDimensions()
const vspace = 30
const screenPadding = 15
const screenPaddingHorizontal =  2*screenPadding
const textInputStyle = {
  fontFamily:'Poiret',backgroundColor:'transparent',color:Colors.blue,width:screen.width-screenPaddingHorizontal,textAlign:'center'
}
const distributorInputStyle = {
  fontFamily:'Poiret',backgroundColor:'transparent',color:Colors.blue,textAlign:'left'
}
const inputStyleMedium = {fontSize:medium,height:32,color:Colors.pinkly}
const inputStyleLarge = {fontSize:large,height:32}
const inputStyleLarger = {fontSize:larger,height:64}

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
    isNumericKeyPadOpen: false,
    isUserTypeSubmitModalOpen: false,
    isCellSubmitModalOpen: false,
    cellButton: this.cellButtonDisabled,
    cellButtonBgColor: 'transparent',
    cellButtonColor: Colors.blue,
    DistributorId: this.props.user.distributorx ? this.props.user.distributorx.id : null,
    DistributorDistId: this.props.user.distributorx ? this.props.user.distributorx.distId : null,
    DistributorBizName: this.props.user.distributorx ? this.props.user.distributorx.bizName : null,
    DistributorBizUri: this.props.user.distributorx ? this.props.user.distributorx.bizUri : 'https://',
    DistributorLogoUri: this.props.user.distributorx ? this.props.user.distributorx.logoUri : 'https://'
  }

  componentWillMount(){
    // let rgb = '110,250,253'
    // let b = `rgba(${rgb},.7)`
    // console.log('b',b);
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

  isSsl(url){
    let el4 = url.split('')[4]
    if (el4 === 's') {
      return true
    } else {
      return false
    }
  }

  cleanString(str){
    let cleaned = str.trim()
    return cleaned
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
    let { fbkUserId } = this.state.user
    let { userType,DistributorId } = this.state
    // onChangeText={(name) => name.length > 0 ? this.setState({name}) : null}
    return (
        <View style={{flex:1}}>
          <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            contentContainerStyle={{
              height: userType === 'SHOPPER' ? 600 : userType === 'DIST' && !DistributorId ? 660 : DistributorId ? 860 : 860,
              alignItems:'center',width:screen.width,paddingTop:56,marginBottom:56,paddingHorizontal:screenPadding
            }}
            enableOnAndroid={true}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri:`https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`}}/>
              {this.renderName()}
              {this.renderCellPhone()}
              {this.renderDistributorFields()}
              {this.renderCellSubmitModal()}
              {this.renderUserTypeSubmitModal()}
              <FontPoiret text="logout" size={large} vspace={20} onPress={() => this.logOut()}/>
          </KeyboardAwareScrollView>
        </View>
    )
  }

  renderName(){
    return (
      <TextInput value={this.state.name}
        placeholder="add your full name"
        placeholderTextColor={Colors.transparentWhite}
        style={{...textInputStyle,...inputStyleLarger}}
        onChangeText={(name) => this.setState({name})}
        keyboardType="default"
        onBlur={() => this.updateNameInDb()}
        onSubmitEditing={() => this.updateNameInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={50}
        returnKeyType="done"/>
    )
  }

  renderCellPhone(){
    let { cellPhone } = this.state
    if (cellPhone) {
      return <FontPoiret text={cellPhone} size={large} vspace={vspace} onPress={() => this.setState({isCellSubmitModalOpen:true})}/>
    } else {
      return <FontPoiret text="add cell phone" size={large} vspace={vspace} onPress={() => this.setState({isCellSubmitModalOpen:true})}/>
    }
  }

  renderUserType(){
    let type = this.state.userType
    return (
      <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
        <FontPoiret text="shopper" size={large} color={type === 'SHOPPER' ? Colors.blue : Colors.transparentWhite} style={{paddingBottom:8}}/>
        <MKSwitch
          checked={type === "DIST" ? true : false}
          trackSize={15}
          trackLength={40}
          onColor={Colors.transparentWhite}
          offColor={Colors.transparentWhite}
          thumbOnColor={Colors.pinkly}
          thumbOffColor={Colors.blue}
          rippleColor={Colors.transparentPurplest}
          rippleAniDuration={100}
          onPress={() => this.setState({isUserTypeSubmitModalOpen:true})}
        />
      <FontPoiret text="distributor" size={large} color={type === 'DIST' ? Colors.pinkly : Colors.transparentWhite} style={{paddingBottom:6}}/>
      </View>
    )
  }

  renderDistributorFields(){
    let fieldRow = {flexDirection:'row',width:screen.width*.8,height:60}
    let fieldName = {flex:4,justifyContent:'center',alignItems:'flex-start'}
    let fieldValue = {flex:5,justifyContent:'center'}
    let { userType,DistributorId,DistributorBizName,DistributorBizUri,DistributorLogoUri } = this.state
    return (
      <View style={{borderRadius:12,padding:screenPadding,borderColor:Colors.blue,borderWidth: userType === 'DIST' ? 1 : 0}}>
        <View style={{width:screen.width*.8,height:50,alignItems:'center',justifyContent:'center'}}>
          {this.renderUserType()}
        </View>
        {
          userType === 'DIST' ?
          <View style={fieldRow}>
            <View style={fieldName}><FontPoiret text="distributor id" size={medium}
              color={Colors.blue}/></View>
            <View style={fieldValue}>{this.renderDistId()}</View>
          </View> : null
        }
        {
          DistributorId ?
          <View style={{width:screen.width*.8,height:180}}>
            <View style={fieldRow}>
              <View style={fieldName}><FontPoiret text="business name" size={medium}
                color={Colors.blue}/></View>
              <View style={fieldValue}>{this.renderBizName()}</View>
            </View>
            <View style={fieldRow}>
              <View style={fieldName}><FontPoiret text="linkTr.ee url" size={medium}
                color={Colors.blue}/></View>
              <View style={fieldValue}>{this.renderBizUri()}</View>
            </View>
            <View style={fieldRow}>
              <View style={fieldName}><FontPoiret text="link to logo" size={medium}
                color={Colors.blue}/></View>
              <View style={fieldValue}>{this.renderLogoUri()}</View>
            </View>
          </View> : null
        }
      </View>
    )
  }

  renderDistId(){
    // onChangeText={(DistributorDistId) => DistributorDistId.length > 0 ? this.setState({DistributorDistId}) : null}
    return (
      <TextInput value={this.state.DistributorDistId}
        placeholder="add (required)"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(DistributorDistId) => this.setState({DistributorDistId})}
        keyboardType="default"
        onBlur={() => !this.state.DistributorId ? this.createDistributorInDb() : this.updateDistributorDistIdInDb()}
        onSubmitEditing={() => !this.state.DistributorId ? this.createDistributorInDb() : this.updateDistributorDistIdInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={18}
        returnKeyType="done"/>
    )
  }

  renderBizName(){
    // onChangeText={(DistributorBizName) => DistributorBizName.length > 0 ? this.setState({DistributorBizName}) : null}
    return (
      <TextInput value={this.state.DistributorBizName}
        placeholder="add (optional)"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(DistributorBizName) => this.setState({DistributorBizName})}
        keyboardType="default"
        onBlur={() => this.updateDistributorBizNameInDb()}
        onSubmitEditing={() => this.updateDistributorBizNameInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={50}
        returnKeyType="done"/>
    )
  }

  renderBizUri(){
    return (
      <TextInput value={this.state.DistributorBizUri}
        placeholder="add"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(DistributorBizUri) => DistributorBizUri.length > 7 ? this.setState({DistributorBizUri}) : null}
        keyboardType="default"
        onBlur={() => this.updateDistributorBizUriInDb()}
        onSubmitEditing={() => this.updateDistributorBizUriInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={2083}
        returnKeyType="done"/>
    )
  }

  renderLogoUri(){
    return (
      <TextInput value={this.state.DistributorLogoUri}
        placeholder="add"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(DistributorLogoUri) => DistributorLogoUri.length > 7 ? this.setState({DistributorLogoUri}) : null}
        keyboardType="default"
        onBlur={() => this.updateDistributorLogoUriInDb()}
        onSubmitEditing={() => this.updateDistributorLogoUriInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={2083}
        returnKeyType="done"/>
    )
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

  renderNumericKeypadCell(op,num){
    let keyPadView = {flex:1,height:50,justifyContent:'center',alignItems:'center',margin:10,borderRadius:6}
    let keypadText = {fontFamily:'Poiret',fontSize:large}
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
          width:.85*screen.width,
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
    let userType
    if (this.state.userType === "DIST") {userType = 'SHOPPER'} else {userType = 'DIST'}
    let modalWidth = screen.width*.85
    let modalHeight = screen.height*.75
    let button = {
      width:modalWidth-40,height:50,justifyContent:'center',alignItems:'center',borderRadius:6,backgroundColor:Colors.transparentWhite
    }
    let buttonText = {fontFamily:'Poiret',fontSize:large}
    return (
      <View
        style={{
          ...Views.middleNoFlex,
          width: modalWidth,
          backgroundColor: Colors.purple,
          borderRadius: 15,
          padding: 20,
          maxHeight: modalHeight
        }}>
          <FontPoiret text="about that account type..." size={large} color={Colors.blue}/>
          <ScrollView style={{marginVertical:10}}>
            <Text
              style={{color: Colors.transparentWhite,...Texts.medium}}>
              {`\n`}SHOPPER ACCOUNT{`\n`}
              With a shopper account, you can find a distributor, browse lip colors and test how they look on your lips. When you find colors that look great on you, like or thumbs up them, and your distributor will be automatically notified to reach out to you via chat or by phone.{`\n\n`}
              DISTRIBUTOR ACCOUNT{`\n`}
              With a distributor account, marketing to your customers and prospective customers has never been so awesome. Manage your customers with tools like inventory tracking, chat, and lite order tracking. Provide your customers with your distributor ID so that when they use {AppName} and express interest in a lip color, only you their distributor will be able to engage them in chat (or phone call) to help convert their lip color interests, into a completed sale! After your customer has paid for their lip colors outside of the app (which keeps you in compliance with Senegence), labeling those lip colors as an officially "claimed" or "requested" lip color, will automatically update your inventory so it always stays in sync with your order fulfillment practices outside of {AppName}.
            </Text>
          </ScrollView>
          <TouchableHighlight
            onPress={() => this.updateUserTypeFork(userType)}
            underlayColor={Colors.blue} style={{...button}}>
            <Text style={{...buttonText,color:Colors.purple}}>switch to {userType === 'DIST' ? 'distributor' : 'shopper'}</Text>
          </TouchableHighlight>
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
          onPress={() => this.setState({isUserTypeSubmitModalOpen:false})}
          underlayColor={Colors.purple}>
          <EvilIcons name="close" size={32} color={Colors.blue} />
        </TouchableHighlight>
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

  updateNameInDb(){
    let errText = 'updating your name'
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
          fbkFirstName: this.cleanString(fbkFirstName),
          fbkLastName: this.cleanString(fbkLastName)
        }
      }).then( res => {
        if (res && res.data && res.data.updateUser) {
          let { fbkFirstName,fbkLastName } = res.data.updateUser
          this.setState({
            name: `${fbkFirstName} ${fbkLastName}`,
            user: {
              ...this.state.user,
              fbkFirstName,fbkLastName
            }
          })
        } else {
          this.showModal('err','Profile',errText)
        }
      }).catch( e => {
        this.showModal('err','Profile',errText)
      })
    } else {
      this.showModal('prompt','about that name...','First name and last name only please, or just use one name if you prefer.')
    }
  }

  cellButtonDisabled = () => null
  //updateCellPhoneInDb
  cellButtonEnabled = () => {
    let errText = 'updating your cell phone'
    let { tempCell } = this.state
    let { id } = this.state.user
    let cellPhone = tempCell.replace(/\s/g,"")
    this.props.updateCellPhone({
      variables: {
        userId: id,
        cellPhone
      }
    }).then( res => {
      if (res && res.data && res.data.updateUser) {
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
      } else {
        this.showModal('err','Profile',errText)
      }
    })
    .catch( e => {
      this.showModal('err','Profile',errText)
    })
  }

  updateUserTypeFork(userType){
    if (this.state.userType === 'DIST') {
      this.deleteDistributorInDb(userType)
    } else {
      this.updateUserTypeInDb(userType)
    }
  }

  updateUserTypeInDb(userType){
    let { id } = this.state.user
    let errText = 'updating your account type'
    this.props.updateUserType({
      variables: {
        userId: id,
        type: userType
      }
    }).then( res => {
      if (res && res.data && res.data.updateUser) {
        this.setState({isUserTypeSubmitModalOpen:false},()=>{
          setTimeout(()=>{
            this.setState({userType:res.data.updateUser.type})
          },700)
        })
      } else {
        this.showModal('err','Profile',errText)
      }
    }).catch( e => {
      this.setState({isUserTypeSubmitModalOpen:false},()=>{
        setTimeout(()=>{
          this.showModal('err','Profile',errText)
        },700)
      })
    })
  }

  createDistributorInDb(){
    let { DistributorDistId } = this.state
    let { id } = this.state.user
    let errText = 'adding your Distributor ID'
    if (DistributorDistId && id) {
      this.props.createDistributor({
        variables: {
          DistributorDistId: this.cleanString(DistributorDistId),
          userxId: id
        }
      }).then( res => {
        if (res && res.data && res.data.createDistributor) {
          this.setState({
            DistributorId:res.data.createDistributor.id,
            DistributorDistId:res.data.createDistributor.distId
          })
        } else {
          this.showModal('err','Profile',errText)
        }
      }).catch( e => {
        console.log('createDistributor',e.message)
        // this.showModal('err','Profile',errText)
      })
    } else {
      this.showModal('err','Profile',errText)
    }
  }

  updateDistributorDistIdInDb(){
    let { DistributorId,DistributorDistId } = this.state
    let { id } = this.state.user
    let errText = 'saving your Distributor ID'
    if (DistributorId && DistributorDistId) {
      this.props.updateDistributorDistId({
        variables: {
          DistributorId,
          DistributorDistId: this.cleanString(DistributorDistId)
        }
      }).then( res => {
        if (res && res.data && res.data.updateDistributor) {
          this.setState({DistributorDistId:res.data.updateDistributor.distId})
        } else {
          this.showModal('err','Profile',errText)
        }
      }).catch( e => {
        this.showModal('err','Profile',errText)
      })
    } else {
      this.showModal('err','Profile',errText)
    }
  }

  updateDistributorBizNameInDb(){
    let { DistributorId,DistributorBizName } = this.state
    let { id } = this.state.user
    let errText = 'saving your Business Name'
    if (DistributorId && DistributorBizName) {
      this.props.updateDistributorBizName({
        variables: {
          DistributorId,
          DistributorBizName: this.cleanString(DistributorBizName)
        }
      }).then( res => {
        if (res && res.data && res.data.updateDistributor) {
          this.setState({DistributorBizName:res.data.updateDistributor.bizName})
        } else {
          this.showModal('err','Profile',errText)
        }
      }).catch( e => {
        this.showModal('err','Profile',errText)
      })
    } else {
      this.showModal('err','Profile',errText)
    }
  }

  updateDistributorBizUriInDb(){
    let { DistributorId,DistributorBizUri } = this.state
    let { id } = this.state.user
    let errText = 'saving your Business URL'
    if (!this.isSsl(DistributorBizUri)) {
      this.showModal('error','Profile',"Your URL must begin with 'https'.")
    } else {
      if (DistributorId && DistributorBizUri) {
        this.props.updateDistributorBizUri({
          variables: {
            DistributorId,
            DistributorBizUri: this.cleanString(DistributorBizUri)
          }
        }).then( res => {
          if (res && res.data && res.data.updateDistributor) {
            this.setState({DistributorBizUri:res.data.updateDistributor.bizUri})
          } else {
            this.showModal('err','Profile',errText)
          }
        }).catch( e => {
          this.showModal('err','Profile',errText)
        })
      } else {
        this.showModal('err','Profile',errText)
      }
    }
  }

  updateDistributorLogoUriInDb(){
    let { DistributorId,DistributorLogoUri } = this.state
    let { id } = this.state.user
    let errText = 'saving your Logo URL'
    if (!this.isSsl(DistributorLogoUri)) {
      this.showModal('error','Profile',"Your URL must begin with 'https'.")
    } else {
      if (DistributorId && DistributorLogoUri) {
        this.props.updateDistributorLogoUri({
          variables: {
            DistributorId,
            DistributorLogoUri: this.cleanString(DistributorLogoUri)
          }
        }).then( res => {
          if (res && res.data && res.data.updateDistributor) {
            this.setState({DistributorLogoUri:res.data.updateDistributor.logoUri})
          } else {
            this.showModal('err','Profile',errText)
          }
        }).catch( e => {
          console.log('ggg',e.message);
          this.showModal('err','Profile',errText)
        })
      } else {
        this.showModal('err','Profile',errText)
      }
    }
  }

  deleteDistributorInDb(userType){
    let errText = 'changing your account type from Distributor to Shopper'
    let { DistributorId } = this.state
    if (DistributorId) {
      this.props.deleteDistributor({
        variables: {DistributorId}
      }).then( res => {
        if (res) {
          this.setState({
            DistributorId: null,
            DistributorDistId: null,
            DistributorBizName: null,
            DistributorBizUri: 'https://',
            DistributorLogoUri: 'https://'
          })
          this.updateUserTypeInDb(userType)
        } else {
          this.setState({isUserTypeSubmitModalOpen:false},()=>{
            setTimeout(()=>{
              this.showModal('err','Profile',errText)
            },700)
          })
        }
      }).catch( e => {
        this.setState({isUserTypeSubmitModalOpen:false},()=>{
          setTimeout(()=>{
            this.showModal('err','Profile',errText)
          },700)
        })
      })
    } else {
      this.updateUserTypeInDb(userType)
    }
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
      this.showModal('err','Profile','logging you out')
    }
  }

}

export default compose(
  graphql(UpdateCellPhone,{
    name: 'updateCellPhone'
  }),
  graphql(UpdateName,{
    name: 'updateName'
  }),
  graphql(UpdateUserType,{
    name: 'updateUserType'
  }),
  graphql(CreateDistributor,{
    name: 'createDistributor'
  }),
  graphql(DeleteDistributor,{
    name: 'deleteDistributor'
  }),
  graphql(UpdateDistributorDistId,{
    name: 'updateDistributorDistId'
  }),
  graphql(UpdateDistributorBizName,{
    name: 'updateDistributorBizName'
  }),
  graphql(UpdateDistributorBizUri,{
    name: 'updateDistributorBizUri'
  }),
  graphql(UpdateDistributorLogoUri,{
    name: 'updateDistributorLogoUri'
  })
)(You)
