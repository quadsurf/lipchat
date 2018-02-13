

import {
  MARK_UNREAD,
  MARK_READ,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

const initialChats = []
export const chatStatusReducer = (state = initialChats,actions) => {
  switch(actions.type){
    case MARK_UNREAD:
      let chat = {
        ...actions.chat,
        status: 'unread'
      }
      let chats = actions.chats.unshift(chat)
      return chats
    case MARK_READ:
      let chat = actions.chat
      let chats = JSON.parse(JSON.stringify(actions.chats))
      let index = chats.findIndex( item => chat.id === item.id)
      if (index !== -1) {
        delete chat.status
        chats.splice(index,1,chat)
        return chats
      } else {
        return chats
      }
    default: return state
  }
}

const initialUnreadCount = 0
export const unreadCountReducer = (state = initialUnreadCount,actions) => {
  switch(actions.type){
    case INCREMENT_UNREAD_COUNT:
      return state+1
    case DECREMENT_UNREAD_COUNT:
      return state-1
    default: return state
  }
}