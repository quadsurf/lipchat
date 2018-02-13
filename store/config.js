

import { createStore,combineReducers } from 'redux'
import { chatStatusReducer,unreadCountReducer } from '../screens/Chat/store/reducers'

export default () => {
  const store = createStore(
    combineReducers({
      chatsWithStatus: chatStatusReducer,
      unreadCount: unreadCountReducer
    })
  )
  return store
}