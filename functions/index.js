const functions = require('firebase-functions');
const actions = require('./actions');
const api = require('./api');

module.exports = {
  actions: functions.https.onRequest(actions.actionsFn),
  api: functions.https.onRequest(api.app)
};
