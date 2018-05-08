

import { createStore,combineReducers,applyMiddleware } from 'redux'
// import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import {
  tokensReducer,
  userReducer,shopperReducer,distributorReducer,
  settingsReducer,
  navReducer,
  clientReducer,
  appResetFunc
} from './reducers'
import { chatsReducer,unreadCountReducer } from '../screens/Chat/store/reducers'
import { colorsReducer } from '../screens/Selfie/store/reducers'

const middleware = applyMiddleware(thunk)

export default () => {
  const store = createStore(
    combineReducers({
      chats: chatsReducer,
      unreadCount: unreadCountReducer,
      colors: colorsReducer,
      tokens: tokensReducer,
      user: userReducer,
      shopper: shopperReducer,
      distributor: distributorReducer,
      settings: settingsReducer,
      nav: navReducer,
      client: clientReducer,
      resetApp: appResetFunc
    }),
    middleware
  )
  return store
}