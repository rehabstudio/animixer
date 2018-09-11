let admin;

if (process.env.NODE_ENV === 'test') {
  admin = require('firebase');
} else {
  admin = require('firebase-admin');
}
const { firebaseConfig } = require('./../config');

admin.initializeApp(firebaseConfig);

module.exports = admin;
