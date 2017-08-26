

import { AsyncStorage,Alert } from 'react-native'
// const token = AsyncStorage.getItem('gcToken')

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

//LIBS
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloClient,createNetworkInterface } from 'react-apollo'

const networkInterface = createNetworkInterface({
  uri: `https://api.graph.cool/simple/v1/${PROJECT_ID}`,
  opts: {
    credentials: 'same-origin'
  }
})

const buToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDYzMDE0OTMsImlhdCI6MTUwMzcwOTQ5MywicHJvamVjdElkIjoiY2o1YXllNzN2Z3ZnYjAxMzNnOW41N2V0biIsInVzZXJJZCI6ImNqNm1ya3Z2YjM3ZmwwMTQwYnAwdDdmdDYiLCJtb2RlbE5hbWUiOiJVc2VyIn0.5f36YqbbgcVIRyDQCabD3DJXdKdr1mlke43ImbbzDVk"
//
// const token = null

// console.log('token on AClient: ',token);
// const getToken = () => {
//   let token;
//   // const token = await AsyncStorage.getItem('gcToken')
//   // return token ? `Bearer ${token}` : null
//   AsyncStorage.getItem('gcToken').then(
//     gcToken => {
//       if (gcToken !== null) {
//         token = gcToken
//       } else {
//         token = null
//       }
//     }
//   ).catch(e => {
//     Alert.alert('Error: ',e.message)
//     token = null
//   })
//   return token
// }

const wsClient = new SubscriptionClient(`wss://subscriptions.us-west-2.graph.cool/v1/${PROJECT_ID}`, {
  reconnect: true,
  timeout: 20000,
  connectionParams: {
    Authorization: buToken
  }
})

// wsClient.use([
//   {
//     applyMiddleware(operationOptions, next) {
//       operationOptions["Authorization"] = getToken()
//       next()
//     }
//   }
// ])

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    // if (token !== null) {
    //   req.options.headers['authorization'] = `Bearer ${token}`
    // } else {
    //   req.options.headers['authorization'] = null
    // }
    // next();
    AsyncStorage.getItem('gcToken').then(
          gcToken => {
            if (gcToken !== null) {
              req.options.headers['authorization'] = `Bearer ${gcToken}`
            } else {
              req.options.headers['authorization'] = null
            }
            next()
          },
          failure => {
            Alert.alert('ERROR: ', failure.message)
            next()
          })
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
})

setTimeout(()=>{
  console.log('wsClient',wsClient.connectionParams)
},10000);

export default client
