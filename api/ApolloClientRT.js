

import { AsyncStorage,Alert } from 'react-native';

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

const wsClient = new SubscriptionClient(`wss://subscriptions.us-west-2.graph.cool/v1/${PROJECT_ID}`, {
  reconnect: true,
  timeout: 20000,
  connectionParams: {
    Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTAxMjQ2NDYsImlhdCI6MTUwNzUzMjY0NiwicHJvamVjdElkIjoiY2o1YXllNzN2Z3ZnYjAxMzNnOW41N2V0biIsInVzZXJJZCI6ImNqNnZwenp4bGl6NXgwMTgzNGFhZ2M2aWUiLCJtb2RlbE5hbWUiOiJVc2VyIn0.qOQKJClCbGejKTqdrBGSWAHUSIeP1fDbHKXaUOKT_Kk"
  }
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

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
// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDY1ODAzNDUsImlhdCI6MTUwMzk4ODM0NSwicHJvamVjdElkIjoiY2o1YXllNzN2Z3ZnYjAxMzNnOW41N2V0biIsInVzZXJJZCI6ImNqNnZwenp4bGl6NXgwMTgzNGFhZ2M2aWUiLCJtb2RlbE5hbWUiOiJVc2VyIn0.wYs8Ww-olrX3Y0CoRlYr0DBk-DeSSpV3Aypjs2_88Ls
