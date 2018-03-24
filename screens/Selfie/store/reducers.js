

import SET_COLORS from './types'

const initialColors = []
export const colorsReducer = (state=initialColors,actions) => {
  switch(actions.type){
    case SET_COLORS:
      console.log('chats set on colorsReducer:',[actions.colors[0]])
      return [...actions.colors]
    default: return state
  }
}