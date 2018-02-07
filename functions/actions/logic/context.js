/**
 * Generate a context object for all responses gathering arguments
 *
 * @param  {Object} app     app actions on google app object
 * @param  {array} args     List of values to check for and Return
 * @return {Object}         Object of expected values from dialog flow
 */
function generateContext(app, args) {
  let context = {};
  // Refresh context
  for (let i = 0; i < args.length; i++) {
    context[args[i]] = app.getArgument(args[i]);
    if (!context[args[i]]) {
      console.warn('Missing expected argument: ' + args[i]);
    }
  }
  return context;
}

/**
 *
 */
/**
 * Return True if an animal of the same type is found
 *
 * @param  {Object} context   parsed values from dialog flow
 * @return {boolean}
 */
function animalsIdentical(context) {
  if (
    context.animalHead === context.animalBody &&
    context.animalBody === context.animalLegs
  ) {
    return true;
  }
  return false;
}

/**
 * Return True if an animal of the same type is found
 *
 * @param  {Object} context   parsed values from dialog flow
 * @return {boolean}
 */
function animalsInvalid(context) {
  if (
    context.animalHead === context.animalBody ||
    context.animalBody === context.animalLegs ||
    context.animalLegs === context.animalHead
  ) {
    return true;
  }
  return false;
}

module.exports = {
  animalsIdentical,
  animalsInvalid,
  generateContext
};
