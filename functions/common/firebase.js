const admin = require('firebase-admin');
const { firebaseConfig } = require('./../config');

admin.initializeApp(firebaseConfig);

module.exports = admin;
