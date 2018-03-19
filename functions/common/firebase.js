const firebase = require('firebase');
const { firebaseConfig } = require('./../config');

firebase.initializeApp(firebaseConfig);

module.exports = firebase;
