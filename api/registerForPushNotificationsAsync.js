

import { Permissions, Notifications } from 'expo'
import axios from 'axios'
import { UpdatePushToken } from './db/mutations'
import { method,url } from '../config/Defaults'
//registerForPushNotificationsAsync
export default async (gcToken,userId) => {
  
  let { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)

  if (status !== 'granted') {
    return
  }

  let token = await Notifications.getExpoPushTokenAsync()
  console.log('token from function file',token);
  let headers = { Authorization: `Bearer ${gcToken}` }
  return axios({
    headers,method,url,
    data: {
      query: UpdatePushToken,
      variables: { userId,token }
    }
  })
  
}
