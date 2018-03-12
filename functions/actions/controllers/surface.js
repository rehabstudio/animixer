const animals = require('./animals');

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
  surfaceSwitch
};
