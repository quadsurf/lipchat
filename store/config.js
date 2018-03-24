

import { createStore,combineReducers,applyMiddleware } from 'redux'
// import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import { chatsReducer,unreadCountReducer } from '../screens/Chat/store/reducers'
import { colorsReducer } from '../screens/Selfie/store/reducers'

const middleware = applyMiddleware(thunk)

export default () => {
  const store = createStore(
    combineReducers({
      chats: chatsReducer,
      unreadCount: unreadCountReducer,
      colors: colorsReducer
    }),
    middleware
  )
  return store
}