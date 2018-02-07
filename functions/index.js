process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const firebase = require('firebase');
const rp = require('request-promise');

const { config } = require('./config');
const contextFn = require('./logic/context');
const response = require('./logic/response');
const utils = require('./logic/utils');

firebase.initializeApp(config);

// the action name from the generate_animal Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
const UNKNOWN_ACTION = 'unknown';
const EXIT_ACTION = 'exit';
const SURFACE_SWITCH_ACTION = 'new_surface_intent';
const CHANGE_ANIMAL_ACTION = 'change_value';
// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';
const ANIMAL_CHANGED_ARGUMENT = 'changed';
const UNKNOWN_ARGUMENT = 'noun';

/**
 * Handle unknown animal request
 */
function unknownAnimal(app) {
  let context = contextFn.generateContext(app, [UNKNOWN_ARGUMENT]);
  response.unknownAnimalResponse(app, context.noun);
}

/**
 * If we don't have a screen ask a user to switch to phone
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
    response.screenSwitch(app, context);
    return true;
  }
  return false;
}

/**
 * Handle generate animal request
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
    return response.animalsIdentical(app, context);
  }

  // If 2 of the same selected
  if (contextFn.animalsInvalid(context)) {
    return response.animalsNotValid(app, context);
  }

  context.imageUrl = utils.getImageUrl(context);
  context.audioUrl = utils.getAudioUrl(context);
  // If image doesn't exist display animal not found dialog
  let imagePromise = rp({
    uri: context.imageUrl,
    resolveWithFullResponse: true
  });
  //let audioPromise = rp({ uri: context.audioUrl, resolveWithFullResponse: true });

  // Wait for assets to be found
  return Promise.all([imagePromise])
    .then(responses => {
      if (responses[0].statusCode === 200) {
        if (!skipSwitchScreen && shouldSwitchScreen(app, context)) {
          return;
        }
        response.animalResponse(app, context);
      } else {
        throw 'Animal content not found';
      }
    })
    .catch(err => {
      console.warn('Error: ' + err);
      console.warn('Unable to return gif: ' + context.imageUrl);
      response.notFoundResponse(app);
    });
}

/**
 * Handle good bye message and close conversation
 */
function exit(app) {
  response.exitResponse(app);
}

/**
 * Check that surface switch action was successfull
 *
 * This doesn't do much the same response works on both home and google
 * assistant this just facilitates the switch screen conversion in dialog flow.
 */
function surfaceSwitch(app) {
  if (app.isNewSurface()) {
    generateAnimal(app);
  } else {
    generateAnimal(app, true);
  }
}

/**
 * Generate response if user requests to change one of the animal arguments
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
    return response.changeAnimal(app, context);
  }
}

/**
 * Actions on google mapping of handlers to actions
 */
const animixer = functions.https.onRequest((request, response) => {
  response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generateAnimal);
  actionMap.set(UNKNOWN_ACTION, unknownAnimal);
  actionMap.set(EXIT_ACTION, exit);
  actionMap.set(SURFACE_SWITCH_ACTION, surfaceSwitch);
  actionMap.set(CHANGE_ANIMAL_ACTION, changeAnimal);

  app.handleRequest(actionMap);
});

/**
 * Simple endpoint to generate animal name from list of animals
 */
const animalName = functions.https.onRequest((request, response) => {
  const animal1 = request.query.animal1;
  const animal2 = request.query.animal2;
  const animal3 = request.query.animal3;
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);

  cors(request, response, () => {
    response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.set('Content-Type', 'application/json');
    response.status(200).send(JSON.stringify({ animalName }));
  });
});

/**
 * Mixipedia API endpoint to either get found animals data or POST a newly
 * found animal to update list of found animals
 * @type {Object} actions on google response
 */
const mixipedia = functions.https.onRequest((request, response) => {});

module.exports = {
  animixer,
  animalName,
  mixipedia
};
