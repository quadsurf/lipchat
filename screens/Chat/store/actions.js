

import {
  SET_CHATS,
  MARK_UNREAD,
  MARK_READ,
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

export const incrementUnreadCount = () => ({
  type: INCREMENT_UNREAD_COUNT
})

export const decrementUnreadCount = () => ({
  type: DECREMENT_UNREAD_COUNT
})

export const handleNewChat = (chat,isSelf,isFocused) => {
  return (dispatch) => {
    dispatch(markUnread(chat,isSelf,isFocused))
    isFocused && dispatch(incrementUnreadCount())
  }
}

export const handleClearedChat = chat => {
  return (dispatch,getState) => {
    dispatch(markRead(chat))
    console.log('unreadCount on handleClearedChat:',getState().unreadCount);
    if (getState().unreadCount > 0) dispatch(decrementUnreadCount())
  }
}