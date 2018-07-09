

import React from 'react'

// LIBS
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// LOCALS
import ChatCardLayout from './ChatCardLayout'
import { AppName,chatLabelDIST2SHPRS,dm,gm,support,news,fbkId } from '../../config/Defaults'

// CONSTs
const size = 90

const ChatCard = props => {

  let { chat,userType,viewersStatus,level,userId } = props
  let { id,alias } = chat
  let count = chat.messages.length
  let date = chat.updatedAt
  let chattingWith,bizName,logoUri,status,name,chatTitle,fbkFirstName,fbkLastName,fbkUserId,uri,cellPhone

  if (userType === 'SHOPPER') {
    if (
      chat.distributorsx &&
      chat.distributorsx.length > 0 &&
      chat.distributorsx[0]
    ) {
      chattingWith = chat.distributorsx[0]
      bizName = chattingWith.bizName ? chattingWith.bizName : 'Your Distributor'
      logoUri = chattingWith.logoUri ? chattingWith.logoUri : null
      status = chattingWith.status
      if (chattingWith.userx) {
        fbkUserId = chattingWith.userx.fbkUserId ? chattingWith.userx.fbkUserId : fbkId
        fbkFirstName = chattingWith.userx.fbkFirstName ? chattingWith.userx.fbkFirstName : ''
        fbkLastName = chattingWith.userx.fbkLastName ? chattingWith.userx.fbkLastName : ''
        name = `${fbkFirstName} ${fbkLastName}`
        uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
        cellPhone = chattingWith.userx.cellPhone
      }
    }
    if (chat.type === 'DMSH2DIST') {
      chatTitle = alias ? alias : bizName ? `${dm}${bizName}` : name ? name : 'Unknown'
    }
    if (chat.type === 'DIST2SHPRS') {
      chatTitle = alias ? alias : bizName ? `${gm}${bizName}` : name ? name : 'Unknown'
    }
    if (chat.type === 'SADVR2ALL') {
      chatTitle = alias ? alias : `${AppName}${news}`
    }
    if (chat.type === 'DMU2ADMIN') {
      chatTitle = alias ? alias : `${AppName}${support}`
    }
  }

  if (userType === 'DIST' || userType === 'SADVR') {

    if (chat.type === 'DMSH2DIST') {
      if (chat.shoppersx && chat.shoppersx.length > 0) {
        chattingWith = chat.shoppersx[0]
        // status = chattingWith.status
        if (chattingWith.userx) {
          fbkUserId = chattingWith.userx.fbkUserId ? chattingWith.userx.fbkUserId : fbkId
          fbkFirstName = chattingWith.userx.fbkFirstName ? chattingWith.userx.fbkFirstName : ''
          fbkLastName = chattingWith.userx.fbkLastName ? chattingWith.userx.fbkLastName : ''
          name = `${fbkFirstName} ${fbkLastName}`
          uri = `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
          chatTitle = alias ? alias : name ? `${dm}${name}` : 'Unknown'
          cellPhone = chattingWith.userx.cellPhone
        }
      }
    }

    if (chat.type === 'DIST2SHPRS' || chat.type === 'SADVR2ALL') {
      if (chat.distributorsx && chat.distributorsx.length > 0) {
        chattingWith = chat.distributorsx[0]
        logoUri = chattingWith.logoUri ? chattingWith.logoUri : null
        if (chattingWith.userx) {
          fbkUserId = chattingWith.userx.fbkUserId ? chattingWith.userx.fbkUserId : fbkId
          fbkFirstName = chattingWith.userx.fbkFirstName ? chattingWith.userx.fbkFirstName : ''
          fbkLastName = chattingWith.userx.fbkLastName ? chattingWith.userx.fbkLastName : ''
          name = `${fbkFirstName} ${fbkLastName}`
          uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
          chatTitle = alias ? alias : chat.type === 'SADVR2ALL' ? `${AppName}${news}` : chatLabelDIST2SHPRS
          cellPhone = chattingWith.userx.cellPhone
        }
      }
    }

    if (chat.type === 'DMU2ADMIN') {
      if (level === 'A') {
        if (chat.shoppersx && chat.shoppersx.length > 0) {
          chattingWith = chat.shoppersx[0]
          // status = chattingWith.status
          if (chattingWith.userx) {
            fbkUserId = chattingWith.userx.fbkUserId ? chattingWith.userx.fbkUserId : fbkId
            fbkFirstName = chattingWith.userx.fbkFirstName ? chattingWith.userx.fbkFirstName : ''
            fbkLastName = chattingWith.userx.fbkLastName ? chattingWith.userx.fbkLastName : ''
            name = `${fbkFirstName} ${fbkLastName}`
            uri = `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
            chatTitle = alias ? alias : name ? `${name}${support}` : `No Facebook Name${support}`
            cellPhone = chattingWith.userx.cellPhone
          }
        }
      } else {
        if (chat.distributorsx && chat.distributorsx.length > 0) {
          chattingWith = chat.distributorsx[0]
          logoUri = chattingWith.logoUri ? chattingWith.logoUri : null
          status = chattingWith.status
          if (chattingWith.userx) {
            fbkUserId = chattingWith.userx.fbkUserId ? chattingWith.userx.fbkUserId : fbkId
            fbkFirstName = chattingWith.userx.fbkFirstName ? chattingWith.userx.fbkFirstName : ''
            fbkLastName = chattingWith.userx.fbkLastName ? chattingWith.userx.fbkLastName : ''
            name = `${fbkFirstName} ${fbkLastName}`
            uri = logoUri && logoUri.length > 8 ? logoUri : `https://graph.facebook.com/${fbkUserId}/picture?width=${size}&height=${size}`
            chatTitle = alias ? alias : `${AppName}${support}`
            cellPhone = chattingWith.userx.cellPhone
          }
        }
      }
    }
  }

  let chatSubTitle = chat.type === 'SADVR2ALL' || chat.type === 'DMU2ADMIN' ? null : status ? `by ${name}` : null

  let message = chat.messages.length > 0 ? chat.messages[0].text : 'no chat history'

  if (status) {
      // viewing approved DISTs since they have a status (shoppers do not)
      if (userType === 'DIST' || userType === 'SADVR') {
          if (viewersStatus) {
            // approved DIST viewing an approved DIST
            return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience={level === 'A' ? 'ANY' : 'APPS'} level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
          } else {
            // unapproved DIST viewing an approved DIST
            if (chat.type === 'DMU2ADMIN') {
              return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience="PNDS" level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
            } else {
              return <ChatCardLayout approved={false} line1="your fellow distributors are" line2="waiting for you to get verified"/>
            }
          }
      } else {
        // shopper viewing an approved DIST [tested,passed]
        return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience="SHPS" level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
      }
  } else {
    if (status === false) {
      // viewing unapproved DIST [tested,passed]
      return <ChatCardLayout approved={false} line1="distributor exists but" line2="hasn't been verified yet"/>
    } else {
      // viewing shoppers since they have no status
      if (userType === 'DIST' || userType === 'SADVR') {
          if (viewersStatus) {
            // approved DIST viewing a shopper's chat
            return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience={level === 'A' ? 'ANY' : 'APPS'} level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
            // covers DIST2SHPRS
            // covers SADVR2ALL
          } else {
            // unapproved DIST viewing a shopper's chat [tested,passed]
            if (chat.type === 'DMSH2DIST') {
              return <ChatCardLayout approved={false} line1="this shopper is waiting" line2="for you to get verified"/>
            } else if (chat.type === 'DIST2SHPRS') {
              return <ChatCardLayout approved={false} line1="get verified to group" line2="chat with your shoppers"/>
            } else if (chat.type === 'SADVR2ALL') {
              // unapproved DIST (as Shopper), viewing a DMU2ADMIN
              return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience="PNDS" level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
            } else {
              return <ChatCardLayout approved={false} line1="there was a problem" line2="loading this chat"/>
            }
          }
      } else {
        // shopper viewing shopper
        return <ChatCardLayout chatId={id} approved={true} uri={uri} chatTitle={chatTitle} chatSubTitle={chatSubTitle} chatType={chat.type} audience="SHPS" level={level} message={message} date={date} userId={userId} chat={chat} cellPhone={cellPhone}/>
      }
    }
  }

}

ChatCard.propTypes = {
  viewersStatus: PropTypes.bool.isRequired,
  userType: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired
}

const mapStateToProps = state => ({
  viewersStatus: state.distributor.status,
  userType: state.user.type,
  userId: state.user.id,
  level: state.distributor.level
})

export default connect(mapStateToProps)(ChatCard)
