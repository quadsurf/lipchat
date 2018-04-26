

import { SET_TOKENS,SET_AUTHUSER,SET_ROOTKEY } from './types'

const initialTokens = {
  gc: null,
  fbk: null
}
const tokensReducer = (state=initialTokens,actions) => {
  switch(actions.type){
    case SET_TOKENS:
      let newState = {...state}
      newState.gc = actions.tokens.gc
      newState.fbk = actions.tokens.fbk
      return newState
    default: return state
  }
}