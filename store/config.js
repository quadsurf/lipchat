

import { createStore,combineReducers,applyMiddleware } from 'redux'
// import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import {
  tokensReducer,
  userReducer,shopperReducer,distributorReducer,
  shoppersDistributorsReducer,
  colorsReducer,
  settingsReducer,
  navReducer,
  clientReducer,
  appResetFunc
} from './reducers'
import { chatsReducer,unreadCountReducer,messagesReducer } from '../screens/Chat/store/reducers'

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
      shoppersDistributors: shoppersDistributorsReducer,
      distributor: distributorReducer,
      settings: settingsReducer,
      nav: navReducer,
      client: clientReducer,
      resetApp: appResetFunc,
      messages: messagesReducer
    }),
    middleware
  )
  return store
}
