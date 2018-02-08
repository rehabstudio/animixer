const rp = require('request-promise');

const contextFn = require('./../logic/context');
const responses = require('./responses');
const utils = require('./../../common/utils');
const surface = require('./surface');

// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';
const ANIMAL_CHANGED_ARGUMENT = 'changed';
const UNKNOWN_ARGUMENT = 'noun';

/**
 * Make animal found POST request to api return promise
 * @param  {Object} context dialog flow context with convo values
 * @return {Promise}        request promise for post request
 */
function animalFoundPost(context) {
  return rp({
    uri: 'http://localhost:5000/animixer-1d266/us-central1/api/mixipedia',
    method: 'POST',
    body: {
      animal1: context[ANIMAL1_ARGUMENT],
      animal2: context[ANIMAL2_ARGUMENT],
      animal3: context[ANIMAL3_ARGUMENT]
    },
    json: true
  });
}

/**
 * Handle unknown animal request
 * @param  {Object} app actions on google app object
 */
function unknownAnimal(app) {
  let context = contextFn.generateContext(app, [UNKNOWN_ARGUMENT]);
  responses.unknownAnimalResponse(app, context.noun);
}

/**
 * Handle generate animal request
 *
 * @param  {Object} app     app actions on google app object
 * @param  {boolean} skipSwitchScreen will skip switch screen check to avoid circular
 */
function generateAnimal(app, skipSwitchScreen) {
  let context = contextFn.generateContext(app, [
    ANIMAL1_ARGUMENT,
    ANIMAL2_ARGUMENT,
    ANIMAL3_ARGUMENT
  ]);
  // If we don't have a screen ask to switch device
  skipSwitchScreen = skipSwitchScreen || false;

  // If only one animal selected
  if (contextFn.animalsIdentical(context)) {
    let animalFoundPromise = animalFoundPost(context);
    return Promise.resolve(animalFoundPromise).then(resp => {
      return responses.animalsIdentical(app, context);
    });
  }

  // If 2 of the same selected
  if (contextFn.animalsInvalid(context)) {
    return responses.animalsNotValid(app, context);
  }

  context.imageUrl = utils.getImageUrl(context);
  context.audioUrl = utils.getAudioUrl(context);
  // If image doesn't exist display animal not found dialog
  let imagePromise = rp({
    uri: context.imageUrl,
    resolveWithFullResponse: true
  });
  //let audioPromise = rp({ uri: context.audioUrl, resolveWithFullResponse: true });
  let animalFoundPromise = animalFoundPost(context);

  // Wait for assets to be found
  return Promise.all([imagePromise, animalFoundPromise])
    .then(responseData => {
      if (
        responseData[0].statusCode === 200 &&
        responseData[0].statusCode === 200
      ) {
        if (!skipSwitchScreen && surface.shouldSwitchScreen(app, context)) {
          return;
        }
        responses.animalResponse(app, context);
      } else {
        throw 'Animal content not found';
      }
    })
    .catch(err => {
      console.warn('Error: ' + err);
      console.warn('Unable to return gif: ' + context.imageUrl);
      responses.notFoundResponse(app);
    });
}

/**
 * Generate response if user requests to change one of the animal arguments
 *
 * @param  {Object} app     app actions on google app object
 */
function changeAnimal(app) {
  let context = contextFn.generateContext(app, [
    ANIMAL1_ARGUMENT,
    ANIMAL2_ARGUMENT,
    ANIMAL3_ARGUMENT,
    ANIMAL_CHANGED_ARGUMENT
  ]);
  // if have all animals treat as generate animal response
  if (context.animalHead && context.animalBody && context.animalLegs) {
    return generateAnimal(app);
  } else {
    // else return response to continue journey
    return responses.changeAnimal(app, context);
  }
}

module.exports = {
  changeAnimal,
  generateAnimal,
  unknownAnimal
};
