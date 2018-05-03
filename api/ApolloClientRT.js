

import { AsyncStorage,Alert } from 'react-native';

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

//LIBS
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloClient,createNetworkInterface } from 'react-apollo'

const getClient = (token,store) => {

  let authToken = token ? `Bearer ${token}` : null

  let networkInterface = createNetworkInterface({
    uri: `https://api.graph.cool/simple/v1/${PROJECT_ID}`,
    opts: {
      credentials: 'same-origin'
    }
  })

  let wsClient = new SubscriptionClient(`wss://subscriptions.us-west-2.graph.cool/v1/${PROJECT_ID}`, {
    reconnect: true,
    timeout: 20000,
    connectionParams: {
      Authorization: authToken
    }
  })

  let networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient
  )

  networkInterface.use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      let gcToken = store.getState().tokens.gc
      req.options.headers['authorization'] = gcToken ? `Bearer ${gcToken}` : null
      next()
    }
  }])

  let client = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions,
    queryDeduplication: true
  })

  return client

}

export default getClient