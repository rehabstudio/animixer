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
  uploadTwitter: functions.database
    .ref('/animals/{animalName}')
    .onWrite(triggers.twitter.postAnimal),
  uploadTwitterTest:functions.https.onRequest(triggers.twitter.postAnimalRequest)
  //cleanUserDataWriteTest: functions.https.onRequest(triggers.users.clearOldUserDataTriggerRequest)
};
