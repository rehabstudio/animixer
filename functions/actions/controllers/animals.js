const rp = require('request-promise');

const contextFn = require('./../logic/context');
const responses = require('./responses');
const utils = require('./../../common/utils');
const { APIHost } = require('./../../config');
const animalsModel = require('./../../api/models/animals');

/**
 * Make animal found POST request to api return promise
 * @param  {Object} context dialog flow context with convo values
 * @return {Promise}        request promise for post request
 */
function animalFoundPost(context) {
  return rp({
    uri: APIHost + '/api/mixipedia',
    method: 'POST',
    body: {
      animal1: context[contextFn.ANIMAL1_ARGUMENT],
      animal2: context[contextFn.ANIMAL2_ARGUMENT],
      animal3: context[contextFn.ANIMAL3_ARGUMENT]
    },
    json: true
  });
}

/**
 * Handle unknown animal request
 * @param  {Object} app actions on google app object
 */
function unknownAnimal(app) {
  let context = contextFn.generateContext(app, [contextFn.UNKNOWN_ARGUMENT]);
  responses.unknownAnimalResponse(app, context.noun);
}

/**
 * Handle animal head request
 * @param  {Object} app actions on google app object
 */
function animalHead(app) {
  let context;
  try {
    context = contextFn.generateContext(
      app,
      [contextFn.ANIMAL1_ARGUMENT],
      true
    );
  } catch (e) {
    app.setContext('HeadComplete', 0);
    return unknownAnimal(app, '');
  }

  responses.animalHead(app);
}

/**
 * Handle animal body request
 * @param  {Object} app actions on google app object
 */
function animalBody(app) {
  let context;
  try {
    context = contextFn.generateContext(
      app,
      [contextFn.ANIMAL2_ARGUMENT],
      true
    );
  } catch (e) {
    app.setContext('HeadComplete', 10);
    app.setContext('BodyComplete', 0);
    return unknownAnimal(app);
  }

  responses.animalBody(app, context);
}

/**
 * Handle generate animal request
 *
 * @param  {Object} app     app actions on google app object
 * @param  {boolean} skipSwitchScreen will skip switch screen check to avoid circular
 */
function generateAnimal(app, skipSwitchScreen, context) {
  if (!context) {
    try {
      context = contextFn.generateContext(
        app,
        [
          contextFn.ANIMAL1_ARGUMENT,
          contextFn.ANIMAL2_ARGUMENT,
          contextFn.ANIMAL3_ARGUMENT
        ],
        true
      );
    } catch (e) {
      app.setContext('BodyComplete', 10);
      app.setContext('AnimalComplete', 0);
      return unknownAnimal(app);
    }
  }
  // If we don't have a screen ask to switch device
  skipSwitchScreen = skipSwitchScreen || false;

  // If only one animal selected
  if (contextFn.animalsIdentical(context)) {
    let animalFoundPromise = animalsModel.createUpdateAnimal(
      context.animalHead,
      context.animalBody,
      context.animalLegs
    );
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
  let animalFoundPromise = animalsModel.UpdateOrCreate(
    context.animalHead,
    context.animalBody,
    context.animalLegs
  );

  // Wait for assets to be found
  return Promise.all([imagePromise, animalFoundPromise])
    .then(responseData => {
      if (responseData[0].statusCode === 200 && responseData[1]) {
        if (!skipSwitchScreen && shouldSwitchScreen(app, context)) {
          return;
        }
        context.animalData = responseData[1];
        responses.animalResponse(app, context);
      } else {
        throw new Error('Animal content not found');
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
    contextFn.ANIMAL1_ARGUMENT,
    contextFn.ANIMAL2_ARGUMENT,
    contextFn.ANIMAL3_ARGUMENT,
    contextFn.ANIMAL_CHANGED_ARGUMENT
  ]);
  // if have all animals treat as generate animal response
  if (context.animalHead && context.animalBody && context.animalLegs) {
    app.setContext('animalcomplete', 1);
    return generateAnimal(app);
  } else {
    // else return response to continue journey
    return responses.changeAnimal(app, context);
  }
}

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
 * Injects given suggestion into animal context
 * @type {Object}
 */
function suggestion(app) {
  let animal1 = contextFn.ANIMAL1_ARGUMENT;
  let animal2 = contextFn.ANIMAL2_ARGUMENT;
  let animal3 = contextFn.ANIMAL3_ARGUMENT;
  let suggestion = contextFn.ANIMAL_SUGGESTION;
  let context = contextFn.generateContext(
    app,
    [animal1, animal2, animal3, suggestion],
    false
  );
  let animalContext;
  let params = {};
  let bodyPart;
  params[animal1] = context[animal1];
  params[animal2] = context[animal2];
  params[animal3] = context[animal3];

  if (!context[animal1]) {
    animalContext = animal1;
    params[animal1] = context[suggestion];
    bodyPart = 'head';
  } else if (!context[animal2]) {
    animalContext = animal2;
    params[animal2] = context[suggestion];
    bodyPart = 'body';
  } else if (!context[animal3]) {
    animalContext = animal3;
    params[animal3] = context[suggestion];
    bodyPart = 'legs';
  } else {
    bodyPart = 'legs';
  }

  app.setContext(animalContext.toLowerCase(), 5, params);

  if (bodyPart === 'head') {
    app.setContext('HeadComplete', 10, params);
    app.setContext('BodyComplete', 0);
    return responses.animalHead(app, params);
  } else if (bodyPart === 'body') {
    app.setContext('HeadComplete', 0);
    app.setContext('BodyComplete', 10, params);
    return responses.animalBody(app, params);
  } else if (bodyPart === 'legs') {
    return generateAnimal(app, false, params);
  }
}

module.exports = {
  animalBody,
  animalFoundPost,
  animalHead,
  changeAnimal,
  generateAnimal,
  unknownAnimal,
  suggestion
};
