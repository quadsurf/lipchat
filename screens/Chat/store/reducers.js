

import {
  SET_CHATS,
  ADD_CHAT,
  UPDATE_CHAT,
  REMOVE_CHAT,
  MARK_UNREAD,
  MARK_READ,
  SET_MESSAGES,
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  DELETE_MESSAGE,
  CLEAR_MESSAGES,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

const initialChats = []
export const chatsReducer = (state = initialChats,actions) => {
  let chats,i
  switch(actions.type){
    case SET_CHATS:
      chats = [...actions.chats]
      let chatsWithMessages = []
      let chatsWithoutMessages = []
      chats.forEach(chat => {
        let chatWithMeta = {
          ...chat,
          unreadStatus: false,
          unreadCount: 0
        }
        if (chatWithMeta.messages.length > 0) {
          chatsWithMessages.push(chatWithMeta)
        } else {
          chatsWithoutMessages.push(chatWithMeta)
        }
      })
      chatsWithMessages.sort( (a,b) => {
        return Date.parse(b.messages[0].updatedAt) - Date.parse(a.messages[0].updatedAt)
      })
      let newChats = [
        ...chatsWithMessages,
        ...chatsWithoutMessages
      ]
      return newChats
    case ADD_CHAT:
      // add conditional addition logic
      chats = [
        actions.chat,
        ...state
      ]
      return chats
    case UPDATE_CHAT:
      chats = [...state]
      let { chat:{ id:chatId },isSelf,hasMessage } = actions
      i = chats.findIndex( chat => chat.id === chatId)
      if (i > -1) {
        let updatedChat = {
          ...chats[i],
          ...actions.chat
        }
        if (!isSelf && hasMessage) {
          updatedChat.unreadStatus = true
          updatedChat.unreadCount = ++chats[i].unreadCount
        }
        chats.splice(i,1)
        chats.unshift(updatedChat)
        return chats
      } else {
        return chats
      }
    case REMOVE_CHAT:
      chats = [...state]
      i = chats.findIndex( chat => chat.id === actions.chatId )
      i > -1 && chats.splice(i,1)
      return chats
    case MARK_UNREAD:
      let chatFromState = state.find( chat => chat.id === actions.chat.id )
      // console.log('chatFromState count',chatFromState.unreadCount)
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
      // console.log('unnreadChat count after',unreadChat.unreadCount)
      chats = [...state]
      i = chats.findIndex( chat => chat.id === actions.chat.id )
      if (i !== -1) {
        chats.splice(i,1)
      }
      chats.unshift(unreadChat)
      return chats
    case MARK_READ:
      chats = [...state]
      i = chats.findIndex( chat => chat.id === actions.chatId)
      if (i > -1) {
        chats[i] = {
          ...chats[i],
          unreadStatus: false,
          unreadCount: 0
        }
        return chats
      } else {
        return chats
      }
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

const initialMessages = []
export const messagesReducer = (state=initialMessages,actions) => {
  let messages,message,i
  switch(actions.type){
    case SET_MESSAGES:
      messages = [...state]
      actions.messages.forEach(message=>{
        i = messages.findIndex( msg => msg.id === message.id )
        i === -1 && messages.push(message)
      })
      return messages
    case CREATE_MESSAGE:
      messages = [...state]
      message = actions.message
      i = messages.findIndex( msg => msg.id === message.id )
      i === -1 && messages.unshift(message)
      return messages
    case UPDATE_MESSAGE:
      messages = [...state]
      message = actions.message
      i = messages.findIndex( msg => msg.id === message.id )
      if (i !== -1) {
        messages[i] = {
          ...messages[i],
          ...message
        }
      }
      return messages
    case DELETE_MESSAGE:
      messages = [...state]
      messageId = actions.messageId
      i = messages.findIndex( message => message.id === messageId )
      if (i !== -1) {
        messages.splice(i,1)
      }
      return messages
    case CLEAR_MESSAGES:
      messages = []
      return messages
    default: return state
  }
}
