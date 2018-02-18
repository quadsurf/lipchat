

import {
  SET_CHATS,
  MARK_UNREAD,
  MARK_READ,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

const initialChats = []
export const chatsReducer = (state = initialChats,actions) => {
  let chats,i
  switch(actions.type){
    case SET_CHATS:
      chats = JSON.parse(JSON.stringify(actions.chats))
      chats.sort( (a,b) => {
        return Date.parse(b.messages[0].updatedAt) - Date.parse(a.messages[0].updatedAt)
      })
      return chats
    case MARK_UNREAD:
      let unreadChat = {
        ...actions.chat,
        status: actions.isSelf === true ? 'neither' : 'unread'
      }
      chats = state
      i = chats.findIndex( chatIndex => {
        return chatIndex.id === unreadChat.id
      })
      if (i !== -1) {
        chats.splice(i,1)
      }
      chats.unshift(unreadChat)
      console.log('reducer text',chats[0].messages[0].text);
      return chats
    case MARK_READ:
      let readChat = actions.chat
      chats = state
      i = chats.findIndex( chat => readChat.id === chat.id)
      if (i !== -1) {
        console.log('reducer needs status deletion for chat')
        delete readChat.status
        chats.splice(i,1,readChat)
      }
      return chats
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