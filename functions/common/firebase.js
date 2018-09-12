const { firebaseConfig } = require('./../config');
let firebase;

if (process.env.NODE_ENV === 'test') {
  firebase = require('firebase');

  firebase.initializeApp(firebaseConfig);
} else {
  firebase = require('firebase-admin');

  firebase.initializeApp(firebaseConfig);
}

module.exports = firebase;
