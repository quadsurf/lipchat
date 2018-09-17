

//ENV VARS
import { PROJECT_ID } from 'react-native-dotenv'

const AppName = 'LipChat'
const appStoreBuild = Expo.Constants.manifest.version
const jsOTA = 'a'
const version = `${appStoreBuild}${jsOTA}`
const method = 'post'
const url = `https://api.graph.cool/simple/v1/${PROJECT_ID}`
const newClaimText = 'I am interested in purchasing'
const newClaimText2 = 'What are next steps?'

// CHAT LABELS
const chatLabelDIST2SHPRS = 'Your Shoppers (GroupChat)'
const dm = '(DM) '
const gm = '(GroupChat) '
const support = ' (DM/Support)'
const news = ' Notifications'
const fbkId = '100002537512909'

const tips = `IMPORTANT: select and deselect colors with your face off the screen (in other words, angle the selfie camera away from your face when tapping colors), otherwise the app experience will slow down, stall, or even crash. We are working on optimizing this.

We live by this quote:

"Continuous Improvement is better than Delayed Perfection".

This screen processes enormous amounts of data in real-time, which causes an inconvenient slow-down in performance, which means the app will be slow to react to your finger taps/swipes. We apologize for this, and ask for your patience as we seek to improve/optimize these features. In the meantime though, we recommend the following practices to improve your experience for now:

1. tap and/or swipe slowly

2. wait for the app to react to your actions (turning a color on or off, liking/unliking a color, etc)

3. adjust the distance between your face and your phone until the color overlay matches as close as possible the shape of your lips

IMPORTANT DISCLAIMER: even though these colors were extracted directly from the Senegence website, online representation of a color may not always exactly reflect real-world representation of that same color... please take into consideration that your actual results may vary from what you see in this ${AppName} augmented reality color tester.`

const distIdExplainer = `This is your Senegence distributor ID that you will need to provide your customers with, in order for them to link their ${AppName} shopper account, to your ${AppName} distributor account. Shoppers will need your distributor id in order to find you on ${AppName} and begin ordering from you and chatting with you.`

const bizNameExplainer = `If you wish to be known by your customers as a business, then this is where to customize that. Your group chat channel with your shoppers and all other interactions your customers have with you in ${AppName}, will be under this business name if you add it here. If left blank, it will default to your first and last name, as it is seen on Facebook.`

const bizUriExplainer = `Let your shoppers experience your brand directly inside ${AppName}!

TapBio & LinkTree are both free services that let you effortlessly create a micro-website(LinkTree) or mini-app(TapBio). Both automatically host links & images to all your online marketing destinations (instagram, snapchat, facebook, etc).

Think of them as a one-stop-shop for your customers to consume all your social content, updates, posts, etc.

TapBio takes it a step further by hosting a feed of your instagram, plus it also gives your micro-app a swipeable app-like feel to it. It's like an app within an app... our app becomes your app and your brand!

Set up your own mini-app today at
"https://tap.bio"  or  "https://linkTr.ee"
then paste its link here for all your shoppers to see!`

const logoUriExplainer = `Your shoppers will see this logo throughout the app to quickly identify you. Your Facebook profile pic is the default, so if you wish to not show that pic, here is where you can add a replacement pic.

You will need a link to your logo file, which means you will need to have it hosted on a service that provides you with a secure link ( secure links begin with "https://" ).

Here are some free services that can help you with that:
- imgur.com (must use 'direct link')
- firebase.com (utilizes your gmail account)
- cloudinary
- httpsimage.com`

const bizUriWarning = `Your business link must begin with either "https://tap.bio/" or "https://linktr.ee/".`

const logoUriWarning = `Oops, did you forget the "s" in "https://"?

Or perhaps your logo link is not ending with either ".jpg" or "png"?

As a friendly reminder, your logo link must begin with "https://" and end with either ".jpg" or ".png".`

const AccountTypeExplainer = `${`\n`}SHOPPER ACCOUNT${`\n`}
With a shopper account, use the "Selfie" tab to test how each color virtually looks on your lips (augmented reality). When you find colors that look great on you, just "like" that color to add it to your "Favorites" tab. When you're ready to claim/reserve a color from your distributor's inventory, use the "Favorites" tab to request that color, and your distributor will be automatically notified.${`\n\n\n`}
DISTRIBUTOR ACCOUNT${`\n`}
When customers use augmented reality to virtually test on new lip colors, they're more likely to buy! With a verified distributor account, marketing to your customers and prospective customers has never been so awesome. Manage your customers with tools like inventory tracking, chat, and lite order tracking. Group chat with all your customers too! Remember to provide your customers with your Senegence Distributor ID so that when your customers use ${AppName} and express interest in a lip color, only you their distributor can engage them in a chat (or a phone call) to help convert their lip color interests, into a completed sale! After your customer has paid for their lip colors outside of the app (which keeps you in compliance), labeling those lip colors as an officially "claimed" or "requested" lip color, automatically updates your inventory in ${AppName} (this feature is coming soon, along with automated invoice generation).`

const distIsLiking = 'Liking colors is reserved for Shoppers only.'
const notApprovedToAddInventory = `Inventory Management is a feature reserved for verified Distributors. Please get verified so you can begin taking advantage of this feature!`

const terms = `${AppName} PRIVACY POLICY

This privacy policy has been compiled to better serve those who are concerned with how their 'Personally Identifiable Information' (PII) is being used online. PII, as described in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with ${AppName}.

What personal information do we collect from the people that use ${AppName}?

When ordering or registering on ${AppName}, as appropriate, you may be asked to enter your name, phone number, business profile information or other details to help you with your experience.

When do we collect information?

We collect information from you when you register on ${AppName} or enter information on ${AppName}.


How do we use your information?

We may use the information we collect from you when you register, make a purchase, sign up for our newsletter, respond to a survey or marketing communication, navigate through ${AppName}, or use certain other app features in the following ways:

      • To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.
      • To improve ${AppName} in order to better serve you.
      • To allow us to better service you in responding to your customer service requests.
      • To follow up with them after correspondence (live chat, email or phone inquiries)

How do we protect your information?

We do not use vulnerability scanning and/or scanning to PCI standards.
We only provide articles and information. We never ask for credit card numbers.
We do not use Malware Scanning.

We do not use an SSL certificate
      • We do not need an SSL because:
Apple & Google app stores host and provide that security already.

Do we use 'cookies'?

No. However, we do use local storage/cache to help us remember and process your settings and actions. They are also used to help us understand your preferences based on previous or current app activity, which enables us to provide you with improved services. We also use local storage/cache to help us compile aggregate data about app traffic and app interaction so that we can offer better app experiences and tools in the future.

We use local storage/cache to:
      • Understand and save user's preferences for future visits.
      • Compile aggregate data about app traffic and app interactions in order to offer better app experiences and tools in the future. We may also use trusted third-party services that track this information on our behalf.

You can choose to have your phone clear or reset this data, simply by logging out of your account.


Third-party disclosure

We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include hosting partners and other parties who assist us in operating ${AppName}, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it's release is appropriate to comply with the law, enforce ${AppName} policies, or protect ours or others' rights, property or safety.

However, non-personally identifiable visitor information may be provided to other parties for marketing, advertising, or other uses.

Third-party links

Occasionally, at our discretion, we may include or offer third-party products or services on ${AppName}. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of ${AppName} and welcome any feedback about these sites.

Google

Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en

We have not enabled Google AdSense on ${AppName} but we may do so in the future.

California Online Privacy Protection Act

CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy. The law's reach stretches well beyond California to require any person or company in the United States (and conceivably the world) that operates online entities collecting Personally Identifiable Information from California consumers to post a conspicuous privacy policy on its online entity stating exactly the information being collected and those individuals or companies with whom it is being shared. - See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf

According to CalOPPA, we agree to the following:
Users can use ${AppName} anonymously.
Once this privacy policy is created, we will add a link to it on ${AppName}'s login screen.
Our Privacy Policy link includes the word 'Privacy' and can easily be found at the bottom of the login screen.

You will be notified of any Privacy Policy changes:
      • On our Privacy Policy Modal
Can change your personal information:
      • By logging in to your account

How does ${AppName} handle Do Not Track signals?
We don't honor Do Not Track signals and Do Not Track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place. We don't honor them because:
      • we do not have the resources to build this feature.

Does ${AppName} allow third-party behavioral tracking?
It's also important to note that we allow third-party behavioral tracking

COPPA (Children Online Privacy Protection Act)

When it comes to the collection of personal information from children under the age of 13 years old, the Children's Online Privacy Protection Act (COPPA) puts parents in control. The Federal Trade Commission, United States' consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children's privacy and safety online.

We do not specifically market to children under the age of 13 years old.
Do we let third-parties, including ad networks or plug-ins collect PII from children under 13?

Fair Information Practices

The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information.

In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:
We will notify the users via in-app messaging
      • Within 1 business day if a data breach has been internally confirmed.

We also agree to the Individual Redress Principle which requires that individuals have the right to legally pursue enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that individuals have recourse to courts or government agencies to investigate and/or prosecute non-compliance by data processors.

CAN SPAM Act

The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for commercial messages, gives recipients the right to have emails stopped from being sent to them, and spells out tough penalties for violations.

Since we do not collect your email address, the CAN SPAM Act does not apply to ${AppName}.

____________________________


${AppName} TERMS & CONDITIONS

PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY

AGREEMENT TO TERMS
These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and ${AppName} (“we,” “us” or “our”), concerning your access to and use of the ${AppName} as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “App”). You agree that by accessing the App, you have read, understood, and agree to be bound by all of these Terms and Conditions Use.  IF YOU DO NOT AGREE WITH ALL OF THESE TERMS and CONDITIONS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE App AND YOU MUST DISCONTINUE USE IMMEDIATELY.

Supplemental terms and conditions or documents that may be posted on the App from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms and Conditions at any time and for any reason.  We will alert you about any changes by updating the “Last updated” date of these Terms and Conditions and you waive any right to receive specific notice of each such change.  It is your responsibility to periodically review these Terms and Conditions to stay informed of updates.  You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms and Conditions by your continued use of the App after the date such revised Terms are posted.

The information provided on the App is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the App from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable. 

The App is intended for users who are at least 18 years old. Persons under the age of 13 are not permitted to register in the App.

INTELLECTUAL PROPERTY RIGHTS
Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions.  The Content and the Marks are provided on the App “AS IS” for your information and personal use only.  Except as expressly provided in these Terms of Use, no part of the App and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.

Provided that you are eligible to use the App, you are granted a limited license to access and use the App and to download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you in and to the App, Content and the Marks.

USER REPRESENTATIONS
By using the App, you represent and warrant that: [(1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary;] (3) you have the legal capacity and you agree to comply with these Terms of Use; (5) not a minor in the jurisdiction in which you reside; (6) you will not access the App through automated or non-human means, whether through a bot, script or otherwise; (7) you will not use the App for any illegal or unauthorized purpose;  and (8) your use of the App will not violate any applicable law or regulation.

If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the App (or any portion thereof). 

USER REGISTRATION
You may be required to register with the App. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
 
PROHIBITED ACTIVITIES
You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.

As a user of the App, you agree not to:

systematically retrieve data or other content from the App to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.
make any unauthorized use of the App, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.
use a buying agent or purchasing agent to make purchases on the App.
use the App to advertise or offer to sell goods and services.
circumvent, disable, or otherwise interfere with security-related features of the App, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the App and/or the Content contained therein.
engage in unauthorized framing of or linking to the App.
trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords;
make improper use of our support services or submit false reports of abuse or misconduct.
engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.
interfere with, disrupt, or create an undue burden on the App or the networks or services connected to the App.
attempt to impersonate another user or person or use the username of another user.
sell or otherwise transfer your profile.
use any information obtained from the App in order to harass, abuse, or harm another person.
use the App as part of any effort to compete with us or otherwise use the App and/or the Content for any revenue-generating endeavor or commercial enterprise.
decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the App.
attempt to bypass any measures of the App designed to prevent or restrict access to the App, or any portion of the App.
harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the App to you.
delete the copyright or other proprietary rights notice from any Content.
copy or adapt the App’s software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.
upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party’s uninterrupted use and enjoyment of the App or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the App.
upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats (“gifs”), 1×1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as “spyware” or “passive collection mechanisms” or “pcms”).
except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the App, or using or launching any unauthorized script or other software.
disparage, tarnish, or otherwise harm, in our opinion, us and/or the App.
use the App in a manner inconsistent with any applicable laws or regulations.

USER GENERATED CONTRIBUTIONS
The App may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the App, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the App and through third-party websites.  As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.  When you create or make available any Contributions, you thereby represent and warrant that:

the creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.
you are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the App, and other users of the App to use your Contributions in any manner contemplated by the App and these Terms of Use.
you have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the App and these Terms of Use.
your Contributions are not false, inaccurate, or misleading.
your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.
your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).
your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.
your Contributions do not advocate the violent overthrow of any government or incite, encourage, or threaten physical harm against another.
your Contributions do not violate any applicable law, regulation, or rule.
your Contributions do not violate the privacy or publicity rights of any third party.
your Contributions do not contain any material that solicits personal information from anyone under the age of 18 or exploits people under the age of 18 in a sexual or violent manner.
your Contributions do not violate any federal or state law concerning child pornography, or otherwise intended to protect the health or well-being of minors;
your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.
your Contributions do not otherwise violate, or link to material that violates, any provision of these Terms of Use, or any applicable law or regulation.

Any use of the App in violation of the foregoing violates these Terms of Use and may result in, among other things, termination or suspension of your rights to use the App.

CONTRIBUTION LICENSE
By posting your Contributions to any part of the App [or making Contributions accessible to the App by linking your account from the App to any of your social networking accounts], you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions (including, without limitation, your image and voice) for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing. The use and distribution may occur in any media formats and through any media channels.

This license will apply to any form, media, or technology now known or hereafter developed, and includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.  You waive all moral rights in your Contributions, and you warrant that moral rights have not otherwise been asserted in your Contributions.

We do not assert any ownership over your Contributions.  You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions.  We are not liable for any statements or representations in your Contributions provided by you in any area on the App.  You are solely responsible for your Contributions to the App and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.

We have the right, in our sole and absolute discretion, (1) to edit, redact, or otherwise change any Contributions; (2) to re-categorize any Contributions to place them in more appropriate locations on the App; and (3) to pre-screen or delete any Contributions at any time and for any reason, without notice. We have no obligation to monitor your Contributions.
   
GUIDELINES FOR REVIEWS
We may provide you areas on the App to leave reviews or ratings. When posting a review, you must comply with the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your reviews should not contain offensive profanity, or abusive, racist, offensive, or hate language; (3) your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5) you should not be affiliated with competitors if posting negative reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may not post any false or misleading statements; and (8) you may not organize a campaign encouraging others to post reviews, whether positive or negative.

We may accept, reject, or remove reviews in our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate.  Reviews are not endorsed by us, and do not necessarily represent our opinions or  the views  of any of our affiliates or partners.  We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully-paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to reviews.
   
MOBILE APPLICATION LICENSE
Use License
If you access the App via a mobile application, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the mobile application on wireless electronic devices owned or controlled by you, and to access and use the mobile application on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Terms of Use. You shall not: (1) decompile, reverse engineer, disassemble, attempt to derive the source code of, or decrypt the application; (2) make any modification, adaptation, improvement, enhancement, translation, or derivative work from the application; (3) violate any applicable laws, rules, or regulations in connection with your access or use of the application; (4) remove, alter, or obscure any proprietary notice (including any notice of copyright or trademark) posted by us or the licensors of the application; (5) use the application for any revenue generating endeavor, commercial enterprise, or other purpose for which it is not designed or intended; (6) make the application available over a network or other environment permitting access or use by multiple devices or users at the same time; (7) use the application for creating a product, service, or software that is, directly or indirectly, competitive with or in any way a substitute for the application; (8) use the application to send automated queries to any website or to send any unsolicited commercial e-mail; or (9) use any proprietary information or any of our interfaces or our other intellectual property in the design, development, manufacture, licensing, or distribution of any applications, accessories, or devices for use with the application.

Apple and Android Devices
The following terms apply when you use a mobile application obtained from either the Apple Store or Google Play (each an “App Distributor”) to access the App: (1) the license granted to you for our mobile application is limited to a non-transferable license to use the application on a device that utilizes the Apple iOS or Android operating systems, as applicable, and in accordance with the usage rules set forth in the applicable App Distributor’s terms of service; (2) we are responsible for providing any maintenance and support services with respect to the mobile application as specified in the terms and conditions of this mobile application license contained in these Terms of Use or as otherwise required under applicable law, and you acknowledge that each App Distributor has no obligation whatsoever to furnish any maintenance and support services with respect to the mobile application; (3) in the event of any failure of the mobile application to conform to any applicable warranty, you may notify the applicable App Distributor, and the App Distributor, in accordance with its terms and policies, may refund the purchase price, if any, paid for the mobile application, and to the maximum extent permitted by applicable law, the App Distributor will have no other warranty obligation whatsoever with respect to the mobile application; (4) you represent and warrant that (i) you are not located in a country that is subject to a U.S. government embargo, or that has been designated by the U.S. government as a “terrorist supporting” country and (ii) you are not listed on any U.S. government list of prohibited or restricted parties; (5) you must comply with applicable third-party terms of agreement when using the mobile application, e.g., if you have a VoIP application, then you must not be in violation of their wireless data service agreement when using the mobile application; and (6) you acknowledge and agree that the App Distributors are third-party beneficiaries of the terms and conditions in this mobile application license contained in these Terms of Use, and that each App Distributor will have the right (and will be deemed to have accepted the right) to enforce the terms and conditions in this mobile application license contained in these Terms of Use against you as a third-party beneficiary thereof.    
  
SOCIAL MEDIA
As part of the functionality of the App, you may link your account with online accounts you have with third-party service providers (each such account, a “Third-Party Account”) by either: (1) providing your Third-Party Account login information through the App; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account. You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.  By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the “Social Network Content”) so that it is available on and through the App via your account, including without limitation any friend lists and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account.  Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the App. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the App. You will have the ability to disable the connection between your account on the App and your Third-Party Accounts at any time. PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS.  We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content. You acknowledge and agree that we may access your email address book associated with a Third-Party Account and your contacts list stored on your mobile device or tablet computer solely for purposes of identifying and informing you of those contacts who have also registered to use the App. You can deactivate the connection between the App and your Third-Party Account  by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.

SUBMISSIONS
You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information regarding the App ("Submissions") provided by you to us are non-confidential and shall become our sole property.  We shall own exclusive rights, including all intellectual property rights, and shall be entitled to the unrestricted use and dissemination of these Submissions for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.  You hereby waive all moral rights to any such Submissions, and you hereby warrant that any such Submissions are original with you or that you have the right to submit such Submissions.  You agree there shall be no recourse against us for any alleged or actual infringement or misappropriation of any proprietary right in your Submissions.

THIRD-PARTY WEBSITES AND CONTENT
The App may contain (or you may be sent via the App) links to other websites ("Third-Party Websites") as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties ("Third-Party Content"). Such Third-Party Websites and Third-Party Content are not investigated, monitored, or checked for accuracy, appropriateness, or completeness by us, and we are not responsible for any Third-Party Websites accessed through the App or any Third-Party Content posted on, available through, or installed from the App, including the content, accuracy, offensiveness, opinions, reliability, privacy practices, or other policies of or contained in the Third-Party Websites or the Third-Party Content.  Inclusion of, linking to, or permitting the use or installation of any Third-Party Websites or any Third-Party Content does not imply approval or endorsement thereof by us.  If you decide to leave the App and access the Third-Party Websites or to use or install any Third-Party Content, you do so at your own risk, and you should be aware these Terms of Use no longer govern. You should review the applicable terms and policies, including privacy and data gathering practices, of any website to which you navigate from the App or relating to any applications you use or install from the App. Any purchases you make through Third-Party Websites will be through other websites and from other companies, and we take no responsibility whatsoever in relation to such purchases which are exclusively between you and the applicable third party.  You agree and acknowledge that we do not endorse the products or services offered on Third-Party Websites and you shall hold us harmless from any harm caused by your purchase of such products or services.  Additionally, you shall hold us harmless from any losses sustained by you or harm caused to you relating to or resulting in any way from any Third-Party Content or any contact with Third-Party Websites.

ADVERTISERS
We allow advertisers to display their advertisements and other information in certain areas of the App, such as sidebar advertisements or banner advertisements.  If you are an advertiser, you shall take full responsibility for any advertisements you place on the App and any services provided on the App or products sold through those advertisements.  Further, as an advertiser, you warrant and represent that you possess all rights and authority to place advertisements on the App, including, but not limited to, intellectual property rights, publicity rights, and contractual rights. [As an advertiser, you agree that such advertisements are subject to our Digital Millennium Copyright Act (“DMCA”) Notice and Policy provisions as described below, and you understand and agree there will be no refund or other compensation for DMCA takedown-related issues.]  We simply provide the space to place such advertisements, and we have no other relationship with advertisers.
 
App MANAGEMENT
We reserve the right, but not the obligation, to: (1) monitor the App for violations of these Terms of Use; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Use, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the App or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the App in a manner designed to protect our rights and property and to facilitate the proper functioning of the App.
  
DIGITAL MILLENNIUM COPYRIGHT ACT (DMCA) NOTICE AND POLICY
Notifications
We respect the intellectual property rights of others.  If you believe that any material available on or through the App infringes upon any copyright you own or control, please immediately notify our Designated Copyright Agent using the contact information provided below (a “Notification”).  A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification.  Please be advised that pursuant to federal law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the App infringes your copyright, you should consider first contacting an attorney.

All Notifications should meet the requirements of DMCA 17 U.S.C. § 512(c)(3) and include the following information: (1) A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed; (2) identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works on the App are covered by the Notification, a representative list of such works on the App; (3) identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material; (4) information reasonably sufficient to permit us to contact the complaining party, such as an address, telephone number, and, if available, an email address at which the complaining party may be contacted; (5) a statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law; and (6)  a statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed upon.

Counter Notification
If you believe your own copyrighted material has been removed from the App as a result of a mistake or misidentification, you may submit a written counter notification to us using the contact information provided below (a “Counter Notification”). To be an effective Counter Notification under the DMCA, your Counter Notification must include substantially the following: (1) identification of the material that has been removed or disabled and the location at which the material appeared before it was removed or disabled; (2) a statement that you consent to the jurisdiction of the Federal District Court in which your address is located, or if your address is outside the United States, for any judicial district in which we are located; (3) a statement that you will accept service of process from the party that filed the Notification or the party's agent; (4) your name, address, and telephone number; (5) a statement under penalty of perjury that you have a good faith belief that the material in question was removed or disabled as a result of a mistake or misidentification of the material to be removed or disabled; and (6) your physical or electronic signature.

If you send us a valid, written Counter Notification meeting the requirements described above, we may restore your removed or disabled material, unless we first receive notice from the party filing the Notification informing us that such party has filed a court action to restrain you from engaging in infringing activity related to the material in question. Please note that if you materially misrepresent that the disabled or removed content was removed by mistake or misidentification, you may be liable for damages, including costs and attorney's fees. Filing a false Counter Notification constitutes perjury.

[COPYRIGHT INFRINGEMENTS
We respect the intellectual property rights of others.  If you believe that any material available on or through the App infringes upon any copyright you own or control, please immediately notify us using at the contact information provided below (a “Notification”).  A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification.  Please be advised that pursuant to federal law you may be held liable for damages if you make material misrepresentations in a Notification. Thus, if you are not sure that material located on or linked to by the App infringes your copyright, you should consider first contacting an attorney.]

TERM AND TERMINATION
These Terms of Use shall remain in full force and effect while you use the App. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE App (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE App OR DELETE [YOUR ACCOUNT AND] ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.  

If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.

MODIFICATIONS AND INTERRUPTIONS
We reserve the right to change, modify, or remove the contents of the App at any time or for any reason at our sole discretion without notice.  However, we have no obligation to update any information on our App.  We also reserve the right to modify or discontinue all or part of the App without notice at any time.  We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the App.

We cannot guarantee the App will be available at all times.  We may experience hardware, software, or other problems or need to perform maintenance related to the App, resulting in interruptions, delays, or errors.  We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the App at any time or for any reason without notice to you.  You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the App during any downtime or discontinuance of the App.  Nothing in these Terms of Use will be construed to obligate us to maintain and support the App or to supply any corrections, updates, or releases in connection therewith.

GOVERNING LAW
These Terms of Use and your use of the App are governed by and construed in accordance with the laws of the State of South Carolina applicable to agreements made and to be entirely performed within the State/Commonwealth of South Carolina, without regard to its conflict of law principles.

DISPUTE RESOLUTION
Option 1: Any legal action of whatever nature brought by either you or us (collectively, the “Parties” and individually, a “Party”) shall be commenced or prosecuted in the state and federal courts located in York County, South Carolina, and the Parties hereby consent to, and waive all defenses of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such state and federal courts.  Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Terms of Use.  In no event shall any claim, action, or proceeding brought by either Party related in any way to the App be commenced more than 1 year after the cause of action arose.

Option 2: Informal Negotiations
To expedite resolution and control the cost of any dispute, controversy, or claim related to these Terms of Use (each a "Dispute" and collectively, the “Disputes”) brought by either you or us (individually, a “Party” and collectively, the “Parties”), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least 90 days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.

Binding Arbitration
If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association ("AAA") and, where appropriate, the AAA’s Supplementary Procedures for Consumer Related Disputes ("AAA Consumer Rules"), both of which are available at the AAA website www.adr.org. Your arbitration fees and your share of arbitrator compensation shall be governed by the AAA Consumer Rules and, where appropriate, limited by the AAA Consumer Rules. [If such costs are determined to by the arbitrator to be excessive, we will pay all arbitration fees and expenses.] The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing, but need not provide a statement of reasons unless requested by either Party. The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except where otherwise required by the applicable AAA rules or applicable law, the arbitration will take place in York County, South Carolina. Except as otherwise provided herein, the Parties may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the arbitrator.

If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the state and federal courts located in York County, South Carolina, and the Parties hereby consent to, and waive all defenses of lack of personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts. Application of the United Nations Convention on Contracts for the International Sale of Goods and the the Uniform Computer Information Transaction Act (UCITA) are excluded from these Terms of Use.  

In no event shall any Dispute brought by either Party related in any way to the App be commenced more than 1 year after the cause of action arose. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.

Option 3: Binding Arbitration
To expedite resolution and control the cost of any dispute, controversy or claim related to these Terms of Use (each a "Dispute" and collectively, “Disputes”), any Dispute brought by either you or us (individually, a “Party” and collectively, the “Parties”) shall be finally and exclusively resolved by binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association ("AAA") and, where appropriate, the AAA’s Supplementary Procedures for Consumer Related Disputes ("AAA Consumer Rules"), both of which are available at the AAA website www.adr.org. Your arbitration fees and your share of arbitrator compensation shall be governed by the AAA Consumer Rules and, where appropriate, limited by the AAA Consumer Rules. [If such costs are determined to by the arbitrator to be excessive, we will pay all arbitration fees and expenses.] The arbitration may be conducted in person, through the submission of documents, by phone, or online. The arbitrator will make a decision in writing, but need not provide a statement of reasons unless requested by either Party. The arbitrator must follow applicable law, and any award may be challenged if the arbitrator fails to do so. Except where otherwise required by the applicable AAA rules or applicable law, the arbitration will take place in York County, South Carolina. Except as otherwise provided herein, the Parties may litigate in court to compel arbitration, stay proceedings pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the arbitrator.

If for any reason, a Dispute proceeds in court rather than arbitration, the Dispute shall be commenced or prosecuted in the state and federal courts located in York County, South Carolina, and the Parties hereby consent to, and waive all defenses of lack of, personal jurisdiction, and forum non conveniens with respect to venue and jurisdiction in such state and federal courts. Application of the United Nations Convention on Contracts for the International Sale of Goods and the Uniform Computer Information Transaction Act (UCITA) are excluded from these Terms of Use.  

In no event shall any Dispute brought by either Party related in any way to the App or Services be commenced more than 1 year after the cause of action arose. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.

Option 2/Option 3: Restrictions
The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.

Option 2/Option 3: Exceptions to [Informal Negotiations and] Arbitration
The Parties agree that the following Disputes are not subject to the above provisions concerning [informal negotiations and] binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
 
CORRECTIONS
There may be information on the App that contains typographical errors, inaccuracies, or omissions that may relate to the App, including descriptions, pricing, availability, and various other information.  We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the App at any time, without prior notice.

DISCLAIMER
THE App IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS.  YOU AGREE THAT YOUR USE OF THE App SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE App AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE App’S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THIS App AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE App, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE App, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE App BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE App. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE App, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES.  AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
 
LIMITATIONS OF LIABILITY
IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE App, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. [NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO [THE LESSER OF] [THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.  CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.]
  
INDEMNIFICATION
You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys’ fees and expenses, made by any third party due to or arising out of: (1) [your Contributions]; (2) use of the App;  (3) breach of these Terms of Use; (4) any breach of your representations and warranties set forth in these Terms of Use; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the App with whom you connected via the App. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it. 
  
USER DATA
We will maintain certain data that you transmit to the App for the purpose of managing the App, as well as data relating to your use of the App.  Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the App.  You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
  
ELECTRONIC COMMUNICATIONS,  TRANSACTIONS, AND SIGNATURES
Visiting the App, sending us emails, and completing online forms constitute electronic communications.  You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the App, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE App.  You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.

CALIFORNIA USERS AND RESIDENTS
If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.

MISCELLANEOUS
These Terms of Use and any policies or operating rules posted by us on the App constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Terms of Use shall not operate as a waiver of such right or provision.  These Terms of Use operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time.  We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.  If any provision or part of a provision of these Terms of Use is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Terms of Use and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Terms of Use or use of the App.  You agree that these Terms of Use will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Terms of Use and the lack of signing by the parties hereto to execute these Terms of Use.

Contacting Us

If there are any questions regarding our above terms, conditions, and/or privacy policy, you may contact us using the information below.

${AppName}
1260 Soulsville St
Rock Hill, SC 29732, USA
quadsurf@gmail.com
801-709-1329

Last Edited on 2018-02-10`

export {
  tips,distIdExplainer,bizNameExplainer,bizUriExplainer,logoUriExplainer,bizUriWarning,logoUriWarning,
  AppName,terms,method,url,newClaimText,newClaimText2,version,
  notApprovedToAddInventory,AccountTypeExplainer,distIsLiking,
  chatLabelDIST2SHPRS,dm,gm,support,news,fbkId
}
// const fbkPhotoUri = 'https://graph.facebook.com/100000480052014/picture?width=300&height=300'
