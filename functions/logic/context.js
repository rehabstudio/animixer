/**
 * Generate a context object for all responses gathering arguments
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
 * Return True if an animal of the same type is found
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
