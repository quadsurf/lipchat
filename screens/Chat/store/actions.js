

import {
  SET_CHATS,
  MARK_UNREAD,
  MARK_READ,
  INCREMENT_UNREAD_COUNT,
  DECREMENT_UNREAD_COUNT
} from './types'

export const setChats = (chats) => ({
  type: SET_CHATS,
  chats
})

export const markUnread = (chat,isSelf) => ({
  type: MARK_UNREAD,
  chat,
  isSelf
})

export const markRead = (chat) => ({
  type: MARK_READ,
  chat
})

export const incrementUnreadCount = () => ({
  type: INCREMENT_UNREAD_COUNT
})

export const decrementUnreadCount = () => ({
  type: DECREMENT_UNREAD_COUNT
})