

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

const AppName = 'Appy'
const terms = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const method = 'post'
const url = `https://api.graph.cool/simple/v1/${PROJECT_ID}`
const newClaimText = 'I am interested in purchasing'
const newClaimText2 = 'What are next steps?'
const AccountTypeExplainer = `${`\n`}SHOPPER ACCOUNT${`\n`}
With a shopper account, use the "Selfie" tab to test how each color looks on your lips. When you find colors that look great on you, just tap the "heart" icon to add that color to your "Favorites" tab. When you're ready to claim/reserve a color from your distributor's inventory, use the "Favorites" tab to request that color, and your distributor will be automatically notified.${`\n\n\n`}
DISTRIBUTOR ACCOUNT${`\n`}
With a distributor account, marketing to your customers and prospective customers has never been so awesome. Manage your customers with tools like inventory tracking, chat, and lite order tracking. Provide your customers with your distributor ID so that when they use ${AppName} and express interest in a lip color, only you their distributor will be able to engage them in chat (or phone call) to help convert their lip color interests, into a completed sale! After your customer has paid for their lip colors outside of the app (which keeps you in compliance with Senegence), labeling those lip colors as an officially "claimed" or "requested" lip color, will automatically update your inventory so it always stays in sync with your order fulfillment practices outside of ${AppName}.`

export { AppName,terms,method,url,newClaimText,newClaimText2,AccountTypeExplainer }
// const fbkPhotoUri = 'https://graph.facebook.com/100000480052014/picture?width=300&height=300'
