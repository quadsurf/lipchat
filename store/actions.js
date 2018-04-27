

import { SET_TOKENS,SET_USER,SET_SETTINGS,SET_ROOTKEY,SET_NETWORKCLIENT } from './types'

const setTokens = ({gcToken:gc,fbkToken:fbk}) => ({
  type: SET_TOKENS,
  tokens: { gc,fbk }
})

const setAuthUser = userId => ({
  type: SET_USER,
  userId
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

export {
  setTokens,setAuthUser,setSettings,setRootKey,setNetworkClient
}