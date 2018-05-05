

import { AsyncStorage } from 'react-native'

import {
  SET_TOKENS,CLEAR_TOKENS,
  SET_USER,UPDATE_USER,CLEAR_USER,
  SET_SETTINGS,
  SET_ROOTKEY,
  SET_NETWORKCLIENT,
  SET_APPRESET,CALL_APPRESET,
  SET_SADVRID
} from './types'


const initialTokens = {
  gc: '',
  fbk: ''
}
const tokensReducer = (state=initialTokens,actions) => {
  switch(actions.type){
    case SET_TOKENS:
      let { gc='',fbk='' } = actions.tokens
      let newTokensState = {
        ...state,
        gc,
        fbk
      }
      return newTokensState
    case CLEAR_TOKENS:
      return initialTokens
    default: return state
  }
}


const initialUser = {
  id: ''
}
const userReducer = (state=initialUser,actions) => {
  let newUser
  switch(actions.type){
    case SET_USER:
      let id = actions.userId ? actions.userId : ''
      newUser = {
        ...state,
        id
      }
      return newUser
    case UPDATE_USER:
      let user = actions.user
      newUser = {
        ...state,
        ...user
      }
      // console.log('newUser on redux',newUser);
      return newUser
    case CLEAR_USER:
      return initialUser
    default: return state
  }
}


const initialSettings = {
  screenWidth: 750,
  screenHeight: 1334,
  sadvrId: ''
}
const settingsReducer = (state=initialSettings,actions) => {
  let newSettingsState
  switch(actions.type){
    case SET_SETTINGS:
      let { width:screenWidth=750,height:screenHeight=1334 } = actions.screen
      newSettingsState = {
        ...state,
        screenWidth,
        screenHeight
      }
      return newSettingsState
    case SET_SADVRID:
      let { sadvrId } = actions
      newSettingsState = {
        ...state,
        sadvrId
      }
      return newSettingsState
    default: return state
  }
}


const initialNav = {
  rootKey: ''
}
const navReducer = (state=initialNav,actions) => {
  switch(actions.type){
    case SET_ROOTKEY:
      let rootKey = actions.rootKey ? actions.rootKey : ''
      let newNavState = {
        ...state,
        rootKey
      }
      return newNavState
    default: return state
  }
}


const initialClient = {}
const clientReducer = (state=initialClient,actions) => {
  if (actions.type === SET_NETWORKCLIENT) {
    let { client={} } = actions
    let newClient = JSON.parse(JSON.stringify(client))
    let newClientState = {
      ...state,
      ...newClient
    }
    return newClientState
  } else {
    return state
  }
}

const initialAppReset = {}
const appResetFunc = (state=initialAppReset,actions) => {
  switch(actions.type){
    case SET_APPRESET:
      let newAppReset = {
        resetApp: actions.func
      }
      return newAppReset
    case CALL_APPRESET:
      state.resetApp()
      return state
    default: return state
  }
}


export { tokensReducer,userReducer,settingsReducer,navReducer,clientReducer,appResetFunc }