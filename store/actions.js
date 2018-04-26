

import { SET_TOKENS,SET_AUTHUSER,SET_ROOTKEY } from './types'

const setToken = ({gcToken:gc,fbkToken:fbk}) => ({
  type: SET_TOKENS,
  tokens: { gc,fbk }
})

const setAuthUser = userId => ({
  type: SET_AUTHUSER,
  authUser: userId
})

const setRootKey = rootKey => ({
  type: SET_ROOTKEY,
  rootKey
})

export {
  setToken,setAuthUser,setRootKey
}