

import { MARK_UNREAD,MARK_READ,INCREMENT_UNREAD_COUNT,DECREMENT_UNREAD_COUNT } from './types'

export const markUnread = (chat,chats) => {
  type: MARK_UNREAD,
  chat,
  chats
}

export const markRead = (chat) => {
  type: MARK_READ,
  chat
}

export const incrementUnreadCount = () => {
  type: INCREMENT_UNREAD_COUNT
}

export const decrementUnreadCount = () => {
  type: DECREMENT_UNREAD_COUNT
}