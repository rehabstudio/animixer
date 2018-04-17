// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';
const ANIMAL_CHANGED_ARGUMENT = 'changed';
const UNKNOWN_ARGUMENT = 'noun';
const ANIMAL_SUGGESTION = 'suggestion';

/**
 * Generate a context object for all responses gathering arguments
 *
 * @param  {Object} app     app actions on google app object
 * @param  {array} args     List of values to check for and Return
 * @return {Object}         Object of expected values from dialog flow
 */
function generateContext(app, args, argsRequired) {
  // Default false
  argsRequired = argsRequired !== undefined ? argsRequired : false;
  let context = {};
  let animalArgs = [ANIMAL1_ARGUMENT, ANIMAL2_ARGUMENT, ANIMAL3_ARGUMENT];
  // Refresh context
  for (let i = 0; i < args.length; i++) {
    context[args[i]] = app.getArgument(args[i]);
    if (!context[args[i]]) {
      let errorMsg = 'Missing expected argument: ' + args[i];

      if (argsRequired) {
        console.error(errorMsg);
        throw new Error(errorMsg);
      } else {
        console.warn(errorMsg);
      }
    }
    if (animalArgs.indexOf(args[i]) > -1 && context[args[i]] instanceof Array) {
      if (context[args[i]]) {
        console.log('Converting animal array to string & using first animal');
        context[args[i]] = context[args[i]][0];
      } else {
        context[args[i]] = '';
      }
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
  generateContext,
  ANIMAL1_ARGUMENT,
  ANIMAL2_ARGUMENT,
  ANIMAL3_ARGUMENT,
  ANIMAL_CHANGED_ARGUMENT,
  UNKNOWN_ARGUMENT
};
