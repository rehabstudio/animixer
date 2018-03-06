const functions = require('firebase-functions');
const actions = require('./actions');
const triggers = require('./triggers');
const api = require('./api');

module.exports = {
  actions: functions.https.onRequest(actions.actionsFn),
  api: functions.https.onRequest(api.app),
  cleanUserDataWrite: functions.database
    .ref('/users/{sessionId}')
    .onWrite(triggers.users.clearOldUserDataTrigger),
  test: functions.https.onRequest(triggers.users.clearOldUserDataTrigger)
};
