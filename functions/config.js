process.env.DEBUG = 'actions-on-google:*';

const ENV = process.env.ENV;
const firebaseConfig = {
  apiKey: 'AIzaSyB9j98cQ4v_tu7mLr-gClzWxSNTmAOd8es',
  authDomain: 'animixer-1d266.firebaseapp.com',
  databaseURL: 'https://animixer-1d266.firebaseio.com',
  projectId: 'animixer-1d266',
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575'
};
const twitterConfig = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
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
