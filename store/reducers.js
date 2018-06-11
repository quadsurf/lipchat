

import {
  SET_TOKENS,CLEAR_TOKENS,
  SET_USER,UPDATE_USER,CLEAR_USER,
  SET_DISTRIBUTOR,UPDATE_DISTRIBUTOR,
  SET_SHOPPER,UPDATE_SHOPPER,
  SET_SHOPPERS_DISTRIBUTORS,UPDATE_SHOPPERS_DISTRIBUTOR,CLEAR_SHOPPERS_DISTRIBUTOR,
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


const initialUser = { id:'',type:null }
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
      let { updates } = actions
      newUser = {
        ...state,
        ...updates
      }
      return newUser
    case CLEAR_USER:
      return initialUser
    default: return state
  }
}


const initialShopper = { id:'' }
const shopperReducer = (state=initialShopper,actions) => {
  let newShopper
  switch(actions.type){
    case SET_SHOPPER:
      let { shopper } = actions
      newShopper = {
        ...state,
        ...shopper
      }
      return newShopper
    case UPDATE_SHOPPER:
      let { updates } = actions
      newShopper = {
        ...state,
        ...updates
      }
      return newShopper
    default: return state
  }
}


const initialShoppersDistributors = []
const shoppersDistributorsReducer = (state=initialShoppersDistributors,actions) => {
  let newShoppersDistributors
  switch(actions.type){
    case SET_SHOPPERS_DISTRIBUTORS:
      let { shoppersDistributors } = actions
      newShoppersDistributors = [...shoppersDistributors]
      return newShoppersDistributors
    case UPDATE_SHOPPERS_DISTRIBUTOR:
      let { updates } = actions
      newShoppersDistributors = [...state]
      let distIndex = newShoppersDistributors.findIndex( dist => dist.id === updates.id )
      if (distIndex > -1) {
        newShoppersDistributors[distIndex] = updates
        return newShoppersDistributors
      } else {
        newShoppersDistributors.unshift(updates)
        return newShoppersDistributors
      }
    case CLEAR_SHOPPERS_DISTRIBUTOR:
      let { deleterId } = actions
      let newState = [...state]
      newShoppersDistributors = newState.filter( newShoppersDistributor => newShoppersDistributor.id !== deleterId)
      return newShoppersDistributors
    default: return state
  }
}


const initialDistributor = {
  id: null,
  status: null,
  level: null,
  distId: null,
  bizName: null,
  bizUri: null,
  logoUri: null
}
const distributorReducer = (state=initialDistributor,actions) => {
  let newDistributor
  switch(actions.type){
    case SET_DISTRIBUTOR:
      let { distributor } = actions
      newDistributor = {
        ...state,
        ...distributor
      }
      return newDistributor
    case UPDATE_DISTRIBUTOR:
      let { updates } = actions
      newDistributor = {
        ...state,
        ...updates
      }
      console.log('newDistributor update on redux',newDistributor);
      return newDistributor
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
      let { width:screenWidth=750,height:screenHeight=1334 } = actions.settings.screen
      let { isIPhoneX } = actions.settings
      newSettingsState = {
        ...state,
        screenWidth,
        screenHeight,
        isIPhoneX
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


const initialNav = { rootKey:'' }
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


export {
  tokensReducer,
  userReducer,distributorReducer,shopperReducer,
  shoppersDistributorsReducer,
  settingsReducer,
  navReducer,
  clientReducer,
  appResetFunc
}
