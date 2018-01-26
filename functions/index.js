process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const cors = require('cors')({ origin: true });
const functions = require('firebase-functions');
const firebase = require('firebase');
const rp = require('request-promise');

const { config } = require('./config');
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
 * Handle unknown animal request
 */
function unknownAnimal(app) {
  let context = generateContext(app, [UNKNOWN_ARGUMENT]);
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
 * Return True if an animal of the same type is found
 */
function checkAnimalsValid(context) {
  if (
    context.animalHead === context.animalBody ||
    context.animalBody === context.animalLegs ||
    context.animalLegs === context.animalHead
  ) {
    return false;
  }
  return true;
}

/**
 * Handle generate animal request
 */
function generateAnimal(app, skipSwitchScreen) {
  let context = generateContext(app, [
    ANIMAL1_ARGUMENT,
    ANIMAL2_ARGUMENT,
    ANIMAL3_ARGUMENT
  ]);

  if (!checkAnimalsValid(context)) {
    return response.animalsNotValid(app, context);
  }

  // If we don't have a screen ask to switch device
  skipSwitchScreen = skipSwitchScreen || false;
  if (!skipSwitchScreen && shouldSwitchScreen(app, context)) {
    return;
  }

  let imageName =
    context.animalHead +
    '_' +
    context.animalBody +
    '_' +
    context.animalLegs +
    '_render.gif';
  let audioName =
    [context.animalHead, context.animalBody].sort().join('') + '.wav';
  let imageUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${imageName}`;
  let audioUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${audioName}`;
  // If image doesn't exist display animal not found dialog
  let imagePromise = rp({ uri: imageUrl, resolveWithFullResponse: true });
  //let audioPromise = rp({ uri: audioUrl, resolveWithFullResponse: true });
  context.audioUrl = audioUrl;
  context.imageUrl = imageUrl;

  // Wait for assets to be found
  Promise.all([imagePromise])
    .then(responses => {
      if (responses[0].statusCode === 200 && responses[0].statusCode === 200) {
        response.animalResponse(app, context);
      } else {
        throw 'Animal content not found';
      }
    })
    .catch(err => {
      console.warn('Error: ' + err);
      console.warn('Unable to return gif: ' + imageName);
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

function changeAnimal(app) {
  let context = generateContext(app, [
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

module.exports = {
  animixer,
  animalName
};
