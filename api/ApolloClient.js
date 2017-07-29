

import { AsyncStorage } from 'react-native'

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

//LIBS
import { ApolloClient,createNetworkInterface } from 'react-apollo'

const client = new ApolloClient({
networkInterface: createNetworkInterface({
  uri: `https://api.graph.cool/simple/v1/${PROJECT_ID}`}).use([{
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {}
      }
      AsyncStorage.getItem('gcToken').then(
            gcToken => {
              if (gcToken !== null) {
                req.options.headers['authorization'] = `Bearer ${gcToken}`
              }
              next()
            },
            failure => {
              console.error('ERROR: no token', failure)
              next()
            })
    }
  }]),
  opts: {
    credentials: 'same-origin'
  }
})

export default client
