

import {
  SET_CHATS,
  MARK_UNREAD,
  MARK_READ,
  REMOVE_CHAT,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

export const setChats = chats => ({
  type: SET_CHATS,
  chats
})

export const markUnread = (chat,isSelf,isFocused) => ({
  type: MARK_UNREAD,
  chat,
  isSelf,
  isFocused
})

export const markRead = chat => ({
  type: MARK_READ,
  chat
})

export const removeChat = chatId => ({
  type: REMOVE_CHAT,
  chatId
})

export const incrementUnreadCount = () => ({
  type: INCREMENT_UNREAD_COUNT
})

export const decrementUnreadCount = () => ({
  type: DECREMENT_UNREAD_COUNT
})

export const setMessages = messages => ({
  type: SET_MESSAGES,
  messages
})

export const updateMessage = messageId => ({
  type: UPDATE_MESSAGE
})

export const handleNewChat = (chat,isSelf,isFocused) => {
  return (dispatch) => {
    dispatch(markUnread(chat,isSelf,isFocused))
    // if (chat.hasOwnProperty('unreadStatus')) {
    //   dispatch(markUnread(chat,isSelf,isFocused))
    // } else {
    //   dispatch(markRead(chat))
    // }
    // isFocused && dispatch(incrementUnreadCount())
  }
}

export const handleClearedChat = chat => {
  return (dispatch,getState) => {
    dispatch(markRead(chat))
    // if (getState().unreadCount > 0) dispatch(decrementUnreadCount())
  }
}
