const animals = require('./animals');
const responses = require('./responses');

/**
 * If we don't have a screen ask a user to switch to phone
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function shouldSwitchScreen(app, context) {
  let hasScreen;
  let screenAvailable;
  try {
    hasScreen = app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT);
    screenAvailable = app.hasAvailableSurfaceCapabilities(
      app.SurfaceCapabilities.SCREEN_OUTPUT
    );
  } catch (err) {
    hasScreen = false;
    screenAvailable = false;
  }

  if (!hasScreen && screenAvailable) {
    responses.screenSwitch(app, context);
    return true;
  }
  return false;
}

/**
 * Check that surface switch action was successfull
 *
 * This doesn't do much the same response works on both home and google
 * assistant this just facilitates the switch screen conversion in dialog flow.
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function surfaceSwitch(app) {
  if (app.isNewSurface()) {
    animals.generateAnimal(app);
  } else {
    animals.generateAnimal(app, true);
  }
}

module.exports = {
  shouldSwitchScreen,
  surfaceSwitch
};
