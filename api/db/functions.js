

//processPushNotifications
require('isomorphic-fetch')

module.exports = function (event) {
  var uri = 'https://exp.host/--/api/v2/push/send'
  // var uri = 'http://ptsv2.com/t/x620r-1523655299/post'
  var res = event.data.Chat.node
  var msg = res.messages[0]
  var txt = msg.text
  var senderId = msg.writerx.id
  var senderName = `${msg.writerx.fbkFirstName || ''} ${msg.writerx.fbkLastName || ''}`
  var tokens = []
  
  function reshape(arr) {
  	arr.forEach(function(unit){
    	if (unit.userx.id !== senderId) tokens.push(unit.userx.pushToken)
    })	
  }
  
  reshape(res.distributorsx)
  reshape(res.shoppersx)
  
  function sendNotifications(data) {
    return fetch(uri, {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      }
    }).catch(function(err) {
    	console.log(err)
      	return {
        	error: err
        }	
    })
  }
  
  var newTokens = []
  if (tokens.length <= 100) {
  	tokens.forEach(function(token){
		var notification = {
  			to: token,
    		body: `${senderName}: ${txt}`,
          	title: 'LipChat',
          	ttl: 3600000,
          	priority: 'high',
          	badge: 1
  		}
      	newTokens.push(notification)
    })
    sendNotifications(newTokens)
    	.then(function(response) { return response.json() })
    	.then(function(data) {
    		console.log(data)
      		return {
            	data: data
            }
    	})
  } else {
  	// handle chunking
  }
  
}


// chunking function
function(arr){
  let tokens = [...arr]
  let max = 100
  let blocks = tokens.length / max
  blocks = parseInt(Math.ceil(blocks).toFixed(0))
  let newTokens = []
  for (let i = 0; i < blocks; i++) {
     newTokens.push(tokens.slice(0,max))
     tokens.splice(0,max)
  }
  return newTokens
}


//getFacebookServerSideToken
const fromEvent = require('graphcool-lib').fromEvent

module.exports = function(event) {
  const fbkUser = JSON.parse(event.data.fbkUser)
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  function getGraphcoolUser(fbkUser) {
    return api.request(`
    query {
      User(fbkUserId: "${fbkUser.id}"){
        id
      }
    }`)
      .then( userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.User
        }
      })
  }

  function createGraphcoolUser(fbkUser) {
      const mutation = `mutation(
      $fbkAgeMin: Int,
      $fbkAgeMax: Int,
      $fbkEmail: String,
      $fbkFirstName: String,
      $fbkGender: String,
      $fbkLastName: String,
      $fbkPhotoUri: String,
      $fbkUserId: String!,
      $fbkVerified: Boolean
    ){
      createUser(
        fbkAgeMax: $fbkAgeMax,
        fbkAgeMin: $fbkAgeMin,
        fbkEmail: $fbkEmail,
        fbkFirstName: $fbkFirstName,
        fbkGender: $fbkGender,
        fbkLastName: $fbkLastName,
        fbkPhotoUri: $fbkPhotoUri,
        fbkUserId: $fbkUserId,
        fbkVerified: $fbkVerified,
		shopperx: {},
		distributorx: {}
      ){
          id
      }
    }`
    const vars = {
    	fbkAgeMax: fbkUser.age_range.max,
        fbkAgeMin: fbkUser.age_range.min,
        fbkEmail: fbkUser.email,
        fbkFirstName: fbkUser.first_name,
  		fbkGender: fbkUser.gender,
        fbkLastName: fbkUser.last_name,
        fbkPhotoUri: fbkUser.picture.data.url,
        fbkUserId: fbkUser.id,
        fbkVerified: fbkUser.verified
    }
    return api.request(mutation,vars)
      .then( userMutationResult => {
        if (userMutationResult.error) {
          return Promise.reject(userMutationResult.error)
        } else {
          return userMutationResult.createUser
        }
      })
  }

  function generateGraphcoolToken(graphcoolUserId) {
    return graphcool.generateAuthToken(graphcoolUserId, 'User')
  }

  var user;

  return getGraphcoolUser(fbkUser)
    .then( graphcoolUser => {
      if (graphcoolUser === null) {
        return createGraphcoolUser(fbkUser)
      } else {
        return graphcoolUser
      }
    })
    .then( graphcoolUser => {
  		user = graphcoolUser;
    	return generateGraphcoolToken(graphcoolUser.id)
  	})
    .then( token => {
      	return { data: { token: { gctoken:token,user:user } } }
    })
    .catch( error => {
      	return { error: error.toString() }
    })
}
