

import { createStore,combineReducers } from 'redux'
import { chatsReducer,unreadCountReducer } from '../screens/Chat/store/reducers'

export default () => {
  const store = createStore(
    combineReducers({
      chats: chatsReducer,
      unreadCount: unreadCountReducer
    })
  )
  return store
}