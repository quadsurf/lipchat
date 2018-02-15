

import {
  MARK_UNREAD,
  MARK_READ,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

const initialChats = []
export const chatStatusReducer = (state = initialChats,actions) => {
  let chats
  switch(actions.type){
    case MARK_UNREAD:
      let unreadChat = {
        ...actions.chat,
        status: actions.isSelf === true ? 'neither' : 'unread'
      }
      chats = actions.chats
      chats.unshift(unreadChat)
      return chats
    case MARK_READ:
      let readChat = actions.chat
      chats = JSON.parse(JSON.stringify(actions.chats))
      let index = chats.findIndex( chat => readChat.id === chat.id)
      if (index !== -1) {
        delete readChat.status
        chats.splice(index,1,readChat)
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