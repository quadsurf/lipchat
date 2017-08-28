

import { AsyncStorage,Alert } from 'react-native';

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

//LIBS
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloClient,createNetworkInterface } from 'react-apollo'

const getToken = () => {
  AsyncStorage.getItem('gcToken').then(
    gcToken => {
      let token = gcToken ? `Bearer ${gcToken}` : null
      return token
    },
    failure => {
      Alert.alert('ERROR: ', failure.message)
    }
  )
}

const networkInterface = createNetworkInterface({
  uri: `https://api.graph.cool/simple/v1/${PROJECT_ID}`,
  opts: {
    credentials: 'same-origin'
  }
})

const wsClient = new SubscriptionClient(`wss://subscriptions.us-west-2.graph.cool/v1/${PROJECT_ID}`, {
  reconnect: true,
  timeout: 20000,
  connectionParams: {
    Authorization: getToken()
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

wsClient.use([
  {
    applyMiddleware(operationOptions, next) {
      operationOptions["Authorization"] = getToken()
      next()
    }
  }
])

networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }
    AsyncStorage.getItem('gcToken').then(
      gcToken => {
        req.options.headers['authorization'] = gcToken ? `Bearer ${gcToken}` : null
        next()
      },
      failure => {
        Alert.alert('ERROR: ', failure.message)
        next()
      }
    )
  }
}])

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  queryDeduplication: true
})

export default client
