const functions = require('firebase-functions');
const firebase = require('./../common/firebase');

const database = firebase.database();

// Clear it once a day
const clearInterval = 1000 * 60 * 60 * 24;
// Session data will last week
const sessionDataTTL = 1000 * 60 * 60 * 24 * 7;

/**
 * When user data is set of updated we check to see if should clear the realtime
 * database of old user data
 * @param  {object} event functions.Event object with the db snapshot
 * @return {Promise}      Promise which will resolve if we don't need to run any
 *                        operation or after we have cleared old data.
 */
function clearOldUserDataTrigger(event) {
  console.log('Clear user data trigger started');
  //const original = event.data.val();
  return database
    .ref('/clearData')
    .once('value')
    .then(snapshot => {
      let clearData = snapshot.val();
      let update = true;
      let interval;
      let now = new Date();
      if (clearData) {
        interval = now.getTime() - clearData.timestamp;
        update = interval > clearInterval;
      } else {
        clearData = {};
      }
      if (update) {
        return clearOldUserData(clearData).then(successJson => {
          if (successJson.success == 1) {
            clearData.timestamp_inv = now.getTime() * -1;
            clearData.timestamp = now.getTime();
            return database
              .ref('/clearData')
              .set(clearData)
              .then(() => {
                console.log('Reset timer for clearing user data');
                return { success: 1 };
              })
              .catch(error => {
                console.error('Clear data Write to DB failed: ' + error);
                return { error: error };
              });
          }
        });
      } else {
        console.log('Clear user data trigger called too soon skipping.');
        return null;
      }
    });
}

/**
 * Will clear users/ session state data if it is older than sessionDataTTL
 * @return {Promise} Will resolve when user data has been cleaned
 */
function clearOldUserData(clearData) {
  let now = new Date().getTime();
  return database
    .ref('/users')
    .orderByChild('timestamp')
    .once('value')
    .then(snapshot => {
      let userData = snapshot.val();
      let clearDb = {};
      let sessionIds = [];
      if (userData) {
        sessionIds = Object.keys(userData);
        for (let i = 0; i < sessionIds.length; i++) {
          if (userData[sessionIds[i]].timestamp < now - sessionDataTTL) {
            clearDb[sessionIds[i]] = null;
          }
        }
      }

      return database
        .ref('/users')
        .update(clearDb)
        .then(function() {
          console.info(
            Object.keys(clearDb).length + ' Users session data cleared from db'
          );
          return { success: 1 };
        })
        .catch(function(error) {
          console.error('Clear User session data failed');
          return { success: 0, error: error };
        });
    });
}

module.exports = {
  clearOldUserData,
  clearOldUserDataTrigger
};
