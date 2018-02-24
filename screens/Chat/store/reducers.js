

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
      // chats = JSON.parse(JSON.stringify(actions.chats))
      chats = [...actions.chats]
      chats.sort( (a,b) => {
        return Date.parse(b.messages[0].updatedAt) - Date.parse(a.messages[0].updatedAt)
      })
      let newChats = chats.map( chat => {
        return {
          ...chat,
          unreadStatus: false,
          unreadCount: 0
        }
      })
      return newChats
    case MARK_UNREAD:
      let chatFromState = state.find( chat => chat.id === actions.chat.id )
      let unreadChat = {
        ...actions.chat,
        unreadStatus: chatFromState.unreadStatus,
        unreadCount: chatFromState.unreadCount
      }
      if (!actions.isSelf) {
          if (actions.isFocused) {
            unreadChat.unreadStatus = true
            unreadChat.unreadCount = ++unreadChat.unreadCount
          }
      }
      chats = [...state]
      i = chats.findIndex( chat => chat.id === actions.chat.id )
      if (i !== -1) {
        chats.splice(i,1)
      }
      chats.unshift(unreadChat)
      return chats
    case MARK_READ:
      let readChat = {
        ...actions.chat,
        unreadStatus: false,
        unreadCount: 0
      }
      chats = [...state]
      i = chats.findIndex( chat => readChat.id === chat.id)
      if (i !== -1) {
        chats.splice(i,1,readChat)
      } else {
        chats.unshift(readChat)
      }
      return chats
    default: return state
  }
}

const initialUnreadCount = 0
export const unreadCountReducer = (state = initialUnreadCount,actions) => {
  let newState
  switch(actions.type){
    case INCREMENT_UNREAD_COUNT:
      newState = state+1
      console.log('incrementUnreadCount called',state,newState)
      return newState
    case DECREMENT_UNREAD_COUNT:
      newState = state-1
      console.log('decrementUnreadCount called',state,newState)
      return newState
    default: return state
  }
}