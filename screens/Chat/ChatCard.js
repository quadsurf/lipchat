

import React from 'react'

import ChatCardLayout from './ChatCardLayout'

// CONSTs
const size = 90

const ChatCard = props => {

  let { chat,userType,viewersStatus } = props
  let { id,alias } = chat
  let count = chat.messages.length
  let date = chat.updatedAt
  let chattingWith,bizName,logoUri,status
  let fbkFirstName = ''
  let fbkLastName = ''
  let fbkUserId = '100002537512909'
  
  if (
    userType === 'SHOPPER' && 
    chat.distributorsx && 
    chat.distributorsx.length > 0 && 
    chat.distributorsx[0]
  ) {
    chattingWith =  chat.distributorsx[0]
    bizName = chattingWith.bizName ? chattingWith.bizName : 'Your Distributor'
    logoUri = chattingWith.logoUri
    status = chattingWith.status
  }
  
  if (userType === 'DIST' && chat.shoppersx && chat.shoppersx.length > 0 && chat.shoppersx[0]) {
    chattingWith = chat.shoppersx[0]
  }
  
  if (
    chattingWith && 
    chattingWith.userx && 
    chattingWith.userx.fbkFirstName && 
    chattingWith.userx.fbkLastName && 
    chattingWith.userx.fbkUserId
  ) {
    fbkFirstName = chattingWith.userx.fbkFirstName
    fbkLastName = chattingWith.userx.fbkLastName
    fbkUserId = chattingWith.userx.fbkUserId
  }
  
  let name = `${fbkFirstName} ${fbkLastName}`

  let chatTitle = alias ? alias : userType === 'SHOPPER' ? chat.type === 'DMSH2DIST' ? `DirectChat: ${bizName}` : `GroupChat: ${bizName}` : name
  let chatSubTitle = status ? `by ${name}` : null
  let message = chat.messages.length > 0 ? chat.messages[0].text : 'no chat history'

  let uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`

  if (status) {
      // viewing approved DISTs
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing an approved DIST
            return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date} nav={props.nav}/>
          } else {
            // unapproved DIST viewing an approved DIST
            return <ChatCardLayout approved={false} line1="your fellow distributors are" line2="waiting for you to get approved"/>
          }
      } else {
        // shopper viewing an approved DIST [tested,passed]
        return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date} nav={props.nav}/>
      }
  } else {
    if (status === false) {
      // viewing unapproved DIST [tested,passed]
      return <ChatCardLayout approved={false} line1="distributor exists but has" line2="not been approved yet"/>
    } else {
      // viewing shoppers
      if (userType === 'DIST') {
          if (viewersStatus) {
            // approved DIST viewing a shopper [tested,passed]
            return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date} nav={props.nav}/>
          } else {
            // unapproved DIST viewing a shopper [tested,passed]
            return <ChatCardLayout approved={false} line1="this shopper is waiting" line2="for you to get approved"/>
          }
      } else {
        // shopper viewing shopper
        return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} message={message} date={date} nav={props.nav}/>
      }
    }
  }

}

export default ChatCard
