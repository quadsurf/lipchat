

import {
  SET_TOKENS,CLEAR_TOKENS,
  SET_USER,UPDATE_USER,CLEAR_USER,
  SET_SETTINGS,
  SET_ROOTKEY,
  SET_NETWORKCLIENT,
  SET_APPRESET,CALL_APPRESET
} from './types'

const setTokens = ({gcToken:gc,fbkToken:fbk}) => ({
  type: SET_TOKENS,
  tokens: { gc,fbk }
})

const clearTokens = () => ({
  type: CLEAR_TOKENS
})

const setAuthUser = userId => ({
  type: SET_USER,
  userId
})

const updateUser = user => ({
  type: UPDATE_USER,
  user
})

const clearUser = () => ({
  type: CLEAR_USER
})

const setSettings = screen => ({
  type: SET_SETTINGS,
  screen
})

const setRootKey = rootKey => ({
  type: SET_ROOTKEY,
  rootKey
})

const setNetworkClient = client => ({
  type: SET_NETWORKCLIENT,
  client
})

const setAppReset = func => ({
  type: SET_APPRESET,
  func
})

const resetApp = () => ({ type: CALL_APPRESET })

export {
  setTokens,clearTokens,
  setAuthUser,updateUser,clearUser,
  setSettings,
  setRootKey,
  setNetworkClient,
  setAppReset,resetApp
}