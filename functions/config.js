const functions = require('firebase-functions');
process.env.DEBUG = 'actions-on-google:*';

const ENV = process.env.ENV;
const animixerConfig = functions.config().animixer;

if (!animixerConfig) {
  throw new Error(
    'No config values please look at Account setup in README then run: `$firebase functions:config:get > functions/.runtimeconfig.json`'
  );
}

const firebaseConfig = {
  apiKey: animixerConfig.firebase_api_key,
  authDomain: 'animixer-1d266.firebaseapp.com',
  databaseURL: 'https://animixer-1d266.firebaseio.com',
  projectId: 'animixer-1d266',
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575'
};
const twitterConfig = {
  consumer_key: animixerConfig.twitter_api_key,
  consumer_secret: animixerConfig.twitter_api_secret,
  access_token_key: animixerConfig.twitter_api_token_key,
  access_token_secret: animixerConfig.twitter_api_token_secret
};

const APIHost =
  ENV === 'DEV'
    ? 'http://localhost:5000/animixer-1d266/us-central1'
    : 'https://us-central1-animixer-1d266.cloudfunctions.net';

module.exports = {
  APIHost,
  ENV,
  firebaseConfig,
  twitterConfig
};
