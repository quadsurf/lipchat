

import {
  SET_TOKENS,SET_USER,SET_SETTINGS,SET_ROOTKEY,SET_NETWORKCLIENT,
  UPDATE_USER,CLEAR_USER
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
      return newUser
    case CLEAR_USER:
      AsyncStorage.multiRemove(['fbkToken','gcToken','userId'], (e) => {})
      console.log('user cleared from redux state',initialUser);
      return initialUser
    default: return state
  }
}


const initialSettings = {
  screenWidth: 750,
  screenHeight: 1334
}
const settingsReducer = (state=initialSettings,actions) => {
  switch(actions.type){
    case SET_SETTINGS:
      let { width:screenWidth=750,height:screenHeight=1334 } = actions.screen
      let newSettingsState = {
        ...state,
        screenWidth,
        screenHeight
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


export { tokensReducer,userReducer,settingsReducer,navReducer,clientReducer }