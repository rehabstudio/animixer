const firebase = require('./../../common/firebase');
const database = firebase.database();

/**
 * Get User state for this conversation
 * @param  {Object} app app object instance passed from actions on google sdk
 * @return {Object} user state data object
 */
function getUserState(app) {
  let sessionId = app.body_.sessionId;
  return database
    .ref('users/' + sessionId)
    .once('value')
    .then(snapshot => {
      let userData = snapshot.val();
      if (userData) {
        let userKey = Object.keys(userData)[0];
        return userData[userKey];
      }
      return userData;
    });
}

/**
 * Set User state for this converstation
 * @param  {Object} app app object instance passed from actions on google sdk
 */
function setUserState(app, data) {
  let sessionId = app.body_.sessionId;
  let userKey = 'users/' + sessionId;
  data.timestamp = new Date().getTime();
  data.timestamp_inv = data.timestamp * -1;
  let updateObj = {};
  updateObj[userKey] = data;
  return database
    .ref()
    .update(updateObj)
    .then(function() {
      console.info('User Updated in DB: ' + sessionId);
      return { success: 1 };
    })
    .catch(function(error) {
      console.error('User Update in DB failed: ' + sessionId);
      return { success: 0, error: error };
    });
}

module.exports = {
  getUserState,
  setUserState
};
