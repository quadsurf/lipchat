

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

// LIBS
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { compose,graphql } from 'react-apollo'
import { connect } from 'react-redux'
import Modal from 'react-native-modal'
import { EvilIcons } from '@expo/vector-icons'
import { NavigationActions } from 'react-navigation'
import { debounce } from 'underscore'
import PropTypes from 'prop-types'

// GQL
import {
  UpdateCellPhone,UpdateName,UpdateUserType,
  UpdateDistributorDistId,UpdateDistributorBizName,
  UpdateDistributorBizUri,UpdateDistributorLogoUri,
  CreateGroupChatForDistributor
} from '../../api/db/mutations'

// LOCALS
import { Views,Colors,Texts } from '../../css/Styles'
import { FontPoiret } from '../../assets/fonts/Fonts'
import { Modals,getDimensions,shortenUrl,clipText } from '../../utils/Helpers'
import {
  AppName,AccountTypeExplainer,version,bizLink,bizLinkWarning,logoUriWarning
} from '../../config/Defaults'

// STORE
import { updateUser,resetApp } from '../../store/actions'

// COMPONENTS
import { LinkButton,CardLines,Switch } from '../Common'
import ShoppersDistCard from './ShoppersDistCard'
import Icon from '../Common/Icon'

// CONSTs
const small = Texts.small.fontSize
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
const debugging = __DEV__ && false

class You extends Component {

  constructor(props){
    super(props)
    this.state = {
      isModalOpen: false,
      modalType: 'processing',
      modalContent: {},
      cellPhone: this.props.user.cellPhone,
      tempCell: '',
      name: `${this.props.user.fbkFirstName || 'firstName'} ${this.props.user.fbkLastName || 'lastName'}`,
      isNumericKeyPadOpen: false,
      isUserTypeSubmitModalOpen: false,
      isCellSubmitModalOpen: false,
      cellButton: this.cellButtonDisabled,
      cellButtonBgColor: 'transparent',
      cellButtonColor: Colors.blue,
      ShoppersDist: this.props.shoppersDistributor,
      ShoppersDistId: this.props.shoppersDistributor.distId,
      DistributorDistId: this.props.distributor.distId,
      DistributorBizName: this.props.distributor.bizName,
      DistributorBizUri: this.props.distributor.bizUri,
      DistributorLogoUri: this.props.distributor.logoUri,
      findDistributorQueryIsReady: false
    }
    this.makeFindDistributorReadyForQuery = debounce(this.makeFindDistributorReadyForQuery,1000,true)
  }

  componentWillReceiveProps(newProps){
    if (newProps) {
      if (
        newProps.getDistributor
        && newProps.getDistributor
        && newProps.getDistributor.Distributor
      ) {
        let { DistributorDistId,DistributorBizName,DistributorBizUri,DistributorLogoUri } = this.state
        let { Distributor } = newProps.getDistributor
        if (DistributorDistId === null) {
          this.setState({DistributorDistId:Distributor.distId})
        }
        if (DistributorBizName === null) {
          this.setState({DistributorBizName:Distributor.bizName})
        }
        if (DistributorBizUri === null) {
          this.setState({DistributorBizUri:Distributor.bizUri})
        }
        if (DistributorLogoUri === null) {
          this.setState({DistributorLogoUri:Distributor.logoUri})
        }
      }
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

  openError(errText){
    setTimeout(()=>{
      this.setState({isModalOpen:false},()=>{
        setTimeout(()=>{
          this.showModal('err','Profile',errText)
        },750)
      })
    },750)
  }

  isValidUri(url){
    let el4 = url.split('')[4]
    let last4 = url.substr(url.length - 4)
    if (last4 === '.png' || last4 === '.jpg') {
      if (el4 === 's') {
        return true
      } else {
        return false
      }
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
    let { fbkUserId } = this.props.user
    let uri = `https://graph.facebook.com/${fbkUserId}/picture?width=${imageWidth}&height=${imageWidth}`
    // onChangeText={(name) => name.length > 0 ? this.setState({name}) : null}
    // height: userType === 'SHOPPER' ? 860 : 860,
    return (
        <View style={{flex:1}}>
          <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            contentContainerStyle={{
              height: 860,
              alignItems:'center',width:screen.width,paddingTop:56,marginBottom:56,paddingHorizontal:screenPadding
            }}
            enableOnAndroid={true}>
              <Image
                style={{width:imageWidth,height:imageWidth,borderRadius:.5*imageWidth}} source={{uri}}/>
              {this.renderName()}
              {this.renderCellPhone()}
              {this.renderDistributorFields()}
              {this.renderCellSubmitModal()}
              {this.renderUserTypeSubmitModal()}
              <LinkButton text="logout" onPress={() => this.logOut()}/>
              <Text style={{color:Colors.blue,fontSize:10}}>
                {`v${version}`}
              </Text>
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
      return <FontPoiret
              text={cellPhone}
              size={large}
              vspace={vspace}
              onPress={() => this.openCellSubmitModal()}/>
    } else {
      return <FontPoiret
              text="add cell phone"
              size={large}
              vspace={vspace}
              onPress={() => this.openCellSubmitModal()}/>
    }
  }

  openCellSubmitModal(){
    let { cellPhone } = this.props.user
    if (cellPhone.length === 12) {
      let tempCellArray = cellPhone.split('')
      tempCellArray.splice(7,1,' ','-',' ')
      tempCellArray.splice(3,1,' ','-',' ')
      let tempCell = tempCellArray.join('')
      this.setState({tempCell},()=>{
        this.setState({isCellSubmitModalOpen:true})
      })
    } else {
      this.setState({isCellSubmitModalOpen:true})
    }
  }

  renderUserType(){
    let { userType } = this.props
    return (
      <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
        <FontPoiret text="shopper" size={large} color={userType === 'SHOPPER' ? Colors.blue : Colors.transparentWhite} style={{paddingBottom:8}}/>
        <Switch
          onSwitchPress={() => this.setState({isUserTypeSubmitModalOpen:true})}
          checked={userType === "DIST" ? true : false}/>
        <FontPoiret text="distributor" size={large} color={userType === 'DIST' ? Colors.pinkly : Colors.transparentWhite} style={{paddingBottom:6}}/>
      </View>
    )
  }

  renderShoppersDistCard(){
    if (!this.state.findDistributorQueryIsReady) {
      return (
        <ShoppersDistCard
          isLookUpRequest={false}
          isSearching={false}/>
      )
    } else {
      return (
        <ShoppersDistCard
          isLookUpRequest={true}
          isSearching={true}
          distId={this.state.ShoppersDistId}/>
      )
    }
  }

  renderUserTypeForm(){
    let width = screen.width*.8
    let fieldRow = {flexDirection:'row',width,height:60}
    let fieldName = {flex:4,justifyContent:'center',alignItems:'flex-start'}
    let fieldValue = {flex:5,justifyContent:'center'}
    let { userType } = this.props
    if (userType === 'DIST') {
      return (
        <View style={{width,height:240}}>
          <View style={fieldRow}>
            <View style={fieldName}>
              <FontPoiret
                text="distributor id"
                size={medium}
                color={Colors.blue}/>
            </View>
            <View style={fieldValue}>{this.renderDistId()}</View>
          </View>
          <View style={fieldRow}>
            <View style={fieldName}>
              <FontPoiret
                text="business name"
                size={medium}
                color={Colors.blue}/>
            </View>
            <View style={fieldValue}>{this.renderBizName()}</View>
          </View>
          <View style={fieldRow}>
            <TouchableOpacity
              onPress={() => this.showModal(
                'prompt',
                'your business link',
                bizLink
              )}
              style={[fieldName,{
                flexDirection:'row',justifyContent:'flex-start',alignItems:'center'
              }]}>
              <FontPoiret
                text="Tap.Bio or LinkTr.ee"
                size={small}
                color={Colors.blue}/>
              <Icon family="EvilIcons" name="question"/>
            </TouchableOpacity>
            <View style={fieldValue}>{this.renderBizUri()}</View>
          </View>
          <View style={fieldRow}>
            <View style={fieldName}>
              <FontPoiret
                text="link to logo"
                size={medium}
                color={Colors.blue}/>
            </View>
            <View style={fieldValue}>{this.renderLogoUri()}</View>
          </View>
        </View>
      )
    } else {
      let { shoppersDistributor } = this.props
      let exists = shoppersDistributor && shoppersDistributor.distId ? true : false
      return (
        <View style={{width,height:240}}>
          <View style={{...Views.middle,width,marginBottom:15}}>
            <FontPoiret text={exists ? 'your distributor' : 'find your distributor'} size={large} color={Colors.blue}/>
          </View>
          <View style={{height:105}}>
            {this.renderShoppersDistCard()}
          </View>
          <View style={[fieldRow]}>
            <View style={{flex:5,justifyContent:'center',alignItems:'flex-end'}}>
              <FontPoiret text={exists ? "your distributor\'s id #" : "enter your distributor\'s id #"} size={small} color={Colors.blue}/>
            </View>
            <View style={{flex:3,justifyContent:'center',alignItems:'flex-start',paddingLeft:10}}>
              {this.renderShoppersDistId()}
            </View>
          </View>
        </View>
      )
    }
  }

  renderDistributorFields(){
    let { userType } = this.props
    return (
      <View style={{borderRadius:12,padding:screenPadding,borderColor:userType === 'SHOPPER' ? Colors.blue : Colors.pinkly,borderWidth:1}}>
        <View style={{width:screen.width*.8,height:50,alignItems:'center',justifyContent:'center'}}>
          {this.renderUserType()}
        </View>
        {this.renderUserTypeForm()}
      </View>
    )
  }

  renderShoppersDistId(){
    return (
      <TextInput
        onFocus={() => this.setState({
          formerShoppersDistId: this.state.ShoppersDistId,
          findDistributorQueryIsReady: false,
          isSearching: false
        })}
        value={this.state.ShoppersDistId}
        placeholder="add (optional)"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(ShoppersDistId) => this.setState({ShoppersDistId:ShoppersDistId.trim()})}
        keyboardType="default"
        onBlur={() => this.makeFindDistributorReadyForQuery()}
        onSubmitEditing={() => this.makeFindDistributorReadyForQuery()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={12}
        returnKeyType="search"/>
    )
  }

  makeFindDistributorReadyForQuery(){
    if (this.state.ShoppersDistId !== this.state.formerShoppersDistId) {
      this.setState({findDistributorQueryIsReady:true})
    }
  }

  renderDistId(){
    return (
      <TextInput value={this.state.DistributorDistId}
        placeholder="add (required)"
        placeholderTextColor={Colors.transparentWhite}
        style={{...distributorInputStyle,...inputStyleMedium}}
        onChangeText={(DistributorDistId) => this.setState({DistributorDistId})}
        keyboardType="default"
        onBlur={() => this.updateDistributorDistIdInDb()}
        onSubmitEditing={() => this.updateDistributorDistIdInDb()}
        blurOnSubmit={true}
        autoCorrect={false}
        maxLength={18}
        returnKeyType="done"/>
    )
  }

  renderBizName(){
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
        onChangeText={(DistributorBizUri) => DistributorBizUri.length > 7 ? this.setState({
          DistributorBizUri: DistributorBizUri.toLowerCase()
        }) : null}
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
        onChangeText={(DistributorLogoUri) => DistributorLogoUri.length > 7 ? this.setState({
          DistributorLogoUri: DistributorLogoUri.toLowerCase()
        }) : null}
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
    return (
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
    return (
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
        onPress={
           op === 'submit'
             ? this.state.cellButton
             : () => this.updateCellString(op,num)
        }
        underlayColor={
           op === '+'
             ? Colors.pinkly
             : Colors.transparentWhite
        }
        style={{
          ...keyPadView,
          backgroundColor:
            op === 'submit'
              ? this.state.cellButtonBgColor
              : op === '-'
              ? 'transparent'
              : Colors.transparentWhite
        }}>
        <Text
          style={{
            ...keypadText,
            color:
              op === 'submit'
                ? this.state.cellButtonColor
                : Colors.blue
          }}>
          {num}
        </Text>
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
    if (this.props.userType === "DIST") {userType = 'SHOPPER'} else {userType = 'DIST'}
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
              { AccountTypeExplainer }
            </Text>
          </ScrollView>
          <TouchableHighlight
            onPress={() => this.updateUserTypeInDb(userType)}
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
        let { cellButton } = this.state
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
      let { id } = this.props.user
      if (id) {
        this.props.updateName({
          variables: {
            userId: id,
            fbkFirstName: this.cleanString(fbkFirstName),
            fbkLastName: this.cleanString(fbkLastName)
          }
        }).then( ({ data: { updateUser={} } }) => {
          if (updateUser.hasOwnProperty('id')) {
            let { fbkFirstName='',fbkLastName='' } = updateUser
            this.setState({ name: `${fbkFirstName} ${fbkLastName}` })
            this.props.updateUser({ fbkFirstName,fbkLastName })
          } else {
            this.openError(`${errText}-1`)
          }
        }).catch( e => {
          this.openError(`${errText}-2`)
        })
      } else {
        this.openError(`${errText}-3`)
      }
    } else {
      this.showModal(
        'prompt',
        'about that name...',
        'First name and last name only please, or just use one name if you prefer.'
      )
    }
  }

  cellButtonDisabled = () => null

  cellButtonEnabled = () => {
    let errText = 'updating your cell phone'
    let { tempCell } = this.state
    let { id } = this.props.user
    let cellPhone = tempCell.replace(/\s/g,"")
    if (id && cellPhone) {
      this.props.updateCellPhone({
        variables: {
          userId: id,
          cellPhone
        }
      }).then( ({ data: { updateUser={} } }) => {
        if (updateUser.hasOwnProperty('id')) {
          let { cellPhone } = updateUser
          this.setState({isCellSubmitModalOpen:false},()=>{
            this.setState({
              cellPhone,
              tempCell: '',
              cellButton: this.cellButtonDisabled,
              cellButtonColor: Colors.blue,
              cellButtonBgColor: 'transparent'
            })
          })
          this.props.updateUser({ cellPhone })
        } else {
          this.openError(`${errText}-1`)
        }
      })
      .catch( e => {
        this.openError(`${errText}-2`)
      })
    } else {
      this.openError(`${errText}-3`)
    }
  }

  updateUserTypeInDb(userType){
    let errText = 'updating your account type'
    this.setState({isUserTypeSubmitModalOpen:false},()=>{
      setTimeout(()=>{
        this.showModal('processing')
        let { id } = this.props.user
        if (id && userType) {
          this.props.updateUserType({
            variables: {
              userId: id,
              type: userType
            }
          }).then( res => {
            //
          }).catch( e => {
            this.openError(`${errText}-2`)
          })
        } else {
          this.openError(`${errText}-3`)
        }
      },750)
    })
  }

  updateDistributorDistIdInDb(){
    let { DistributorDistId } = this.state
    let DistributorId = this.props.distributor.id
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
          this.openError(errText)
        }
      }).catch( e => {
        this.openError(errText)
      })
    } else {
      this.openError(errText)
    }
  }

  updateDistributorBizNameInDb(){
    let { DistributorBizName } = this.state
    let DistributorId = this.props.distributor.id
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
          this.openError(errText)
        }
      }).catch( e => {
        this.openError(errText)
      })
    } else {
      this.openError(errText)
    }
  }

  isLinkAllowed(uri){
    let subString = uri.substring(0,17)
    let isAllowed = subString === 'https://tap.bio/@' ? true : subString === 'https://linktr.ee' ? true : false
    return isAllowed
  }

  updateDistributorBizUriInDb(){
    let { DistributorBizUri } = this.state
    let DistributorId = this.props.distributor.id
    let errText = 'saving your Business URL'
    if (!this.isLinkAllowed(DistributorBizUri)) {
      this.showModal('error','Profile',bizLinkWarning)
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
            this.openError(errText)
          }
        }).catch( e => {
          this.openError(errText)
        })
      } else {
        this.openError(errText)
      }
    }
  }

  updateDistributorLogoUriInDb(){
    let { DistributorLogoUri } = this.state
    let DistributorId = this.props.distributor.id
    let errText = 'saving your Logo URL'
    if (!this.isValidUri(DistributorLogoUri)) {
      this.showModal('error','Profile',logoUriWarning)
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
            this.openError(errText)
          }
        }).catch( e => {
          if (debugging) console.log('Error: ',e.message);
          this.openError(errText)
        })
      } else {
        this.openError(errText)
      }
    }
  }

  logOut(){
    this.showModal('processing')
    AsyncStorage.multiRemove(['tokens','user'], (e) => {
      setTimeout(()=>{
        this.setState({ isModalOpen:false },()=>{
          this.props.resetApp()
        })
      },2000)
    })
  }

}

You.propTypes = {
  user: PropTypes.object.isRequired,
  userType: PropTypes.string.isRequired,
  distributor: PropTypes.object.isRequired,
  shoppersDistributor: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  user: state.user,
  userType: state.user.type,
  distributor: state.distributor,
  shoppersDistributor: state.shoppersDistributors.length > 0 ? state.shoppersDistributors[0] : {}
})

const YouWithData = compose(
  graphql(UpdateCellPhone,{
    name: 'updateCellPhone'
  }),
  graphql(UpdateName,{
    name: 'updateName'
  }),
  graphql(UpdateUserType,{
    name: 'updateUserType'
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
  }),
  graphql(CreateGroupChatForDistributor,{
    name: 'createGroupChatForDistributor'
  })
)(You)

export default connect(mapStateToProps,{ updateUser,resetApp })(YouWithData)

// refactoring to-dos: centralize button styling, disable submit buttons onPress with spinning loader, error handling, url tester
// from renderBizName func: onChangeText={(DistributorBizName) => DistributorBizName.length > 0 ? this.setState({DistributorBizName}) : null}
//updateCellPhoneInDb from cellButtonEnabled func
