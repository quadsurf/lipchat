

import { MARK_UNREAD,MARK_READ,INCREMENT_UNREAD_COUNT,DECREMENT_UNREAD_COUNT } from './types'

const initialChats = []
const chatStatusReducer = (state = initialChats,actions) => {
  switch(actions.type){
    case MARK_UNREAD:
      let chat = {
        ...actions.chat,
        status: 'unread'
      }
      let chats = actions.chats.unshift(chat)
      return chats
  }
}