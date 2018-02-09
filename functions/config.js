process.env.DEBUG = 'actions-on-google:*';

const ENV = process.env.ENV === 'DEV' ? 'dev' : 'prod';
const config = {
  apiKey: 'AIzaSyB9j98cQ4v_tu7mLr-gClzWxSNTmAOd8es',
  authDomain: 'animixer-1d266.firebaseapp.com',
  databaseURL: 'https://animixer-1d266.firebaseio.com',
  projectId: 'animixer-1d266',
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575'
};
const APIHost =
  ENV === 'DEV'
    ? 'http://localhost:5000/animixer-1d266/us-central1'
    : 'https://us-central1-animixer-1d266.cloudfunctions.net';

module.exports = {
  ENV,
  config
};
