

import SET_COLORS from './types'

const initialColors = []
export const colorsReducer = (state=initialColors,actions) => {
  switch(actions.type){
    case SET_COLORS:
      return [...actions.colors]
    default: return state
  }
}