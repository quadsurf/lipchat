

import {
  SET_TOKENS,CLEAR_TOKENS,
  SET_USER,UPDATE_USER,CLEAR_USER,
  SET_SHOPPER,UPDATE_SHOPPER,
  SET_DISTRIBUTOR,UPDATE_DISTRIBUTOR,
  SET_SHOPPERS_DISTRIBUTORS,UPDATE_SHOPPERS_DISTRIBUTOR,CLEAR_SHOPPERS_DISTRIBUTOR,
  SET_COLORS,
  SET_SETTINGS,
  SET_ROOTKEY,
  SET_NETWORKCLIENT,
  SET_APPRESET,CALL_APPRESET,
  SET_SADVRID
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

const updateUser = updates => ({
  type: UPDATE_USER,
  updates
})

const clearUser = () => ({
  type: CLEAR_USER
})

const setShopper = shopper => ({
  type: SET_SHOPPER,
  shopper
})

const updateShopper = updates => ({
  type: UPDATE_SHOPPER,
  updates
})

const setShoppersDistributors = shoppersDistributors => ({
  type: SET_SHOPPERS_DISTRIBUTORS,
  shoppersDistributors
})

const updateShoppersDistributor = updates => ({
  type: UPDATE_SHOPPERS_DISTRIBUTOR,
  updates
})

const clearShoppersDistributor = id => ({
  type: CLEAR_SHOPPERS_DISTRIBUTOR,
  deleterId: id
})

const setDistributor = distributor => ({
  type: SET_DISTRIBUTOR,
  distributor
})

const updateDistributor = updates => ({
  type: UPDATE_DISTRIBUTOR,
  updates
})

const setColors = colors => ({
  type: SET_COLORS,
  colors
})

const setSettings = (screen,isIPhoneX) => ({
  type: SET_SETTINGS,
  settings: {
    screen,
    isIPhoneX
  }
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

const setSadvrId = sadvrId => ({
  type: SET_SADVRID,
  sadvrId
})

export {
  setTokens,clearTokens,
  setAuthUser,updateUser,clearUser,
  setDistributor,updateDistributor,
  setShopper,updateShopper,
  setShoppersDistributors,updateShoppersDistributor,clearShoppersDistributor,
  setColors,
  setSettings,setSadvrId,
  setRootKey,
  setNetworkClient,
  setAppReset,resetApp
}
