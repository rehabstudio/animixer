const functions = require('firebase-functions');
const admin = require('firebase-admin');

const serviceAccount = require('./certs/animixer-pk.json');

process.env.DEBUG = 'actions-on-google:*';

const ENV = process.env.ENV;
const envKeys = [
  'FIREBASE_API_KEY',
  'TWITTER_CONSUMER_KEY',
  'TWITTER_CONSUMER_SECRET',
  'TWITTER_ACCESS_TOKEN_KEY',
  'TWITTER_ACCESS_TOKEN_SECRET'
];
const projectId = process.env.GCLOUD_PROJECT || 'animixer-1d266';
let animixerConfig;

console.log('Project ID:', projectId);

try {
  animixerConfig = functions.config().animixer;
} catch (err) {
  console.info('firebase config unavailable');
}

// Will use regular env variables on circle or locally
if (!animixerConfig) {
  animixerConfig = {};
  let envVars = envKeys.every(key => {
    return eval(`process.env.${key}`) !== undefined;
  });
  if (envVars) {
    animixerConfig.firebase_api_key = process.env.FIREBASE_API_KEY;
    animixerConfig.twitter_api_key = process.env.TWITTER_CONSUMER_KEY;
    animixerConfig.twitter_api_secret = process.env.TWITTER_CONSUMER_SECRET;
    animixerConfig.twitter_api_token_key = process.env.TWITTER_ACCESS_TOKEN_KEY;
    animixerConfig.twitter_api_token_secret =
      process.env.TWITTER_ACCESS_TOKEN_SECRET;
  } else {
    console.error(
      'No config values please look at Account setup in README then run: `$firebase functions:config:get > functions/.runtimeconfig.json`'
    );
  }
}

const firebaseConfig = {
  apiKey: animixerConfig.firebase_api_key,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}.firebaseio.com`,
  projectId: `${projectId}`,
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575',
  credential: admin.credential.cert(serviceAccount)
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
    : `https://us-central1-${projectId}.cloudfunctions.net`;

const Host =
  projectId == 'animixer-1d266'
    ? 'https://safarimixer.beta.rehab'
    : 'https://animixer-dev.firebaseapp.com';

module.exports = {
  APIHost,
  Host,
  ENV,
  firebaseConfig,
  twitterConfig
};
