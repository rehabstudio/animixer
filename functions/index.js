process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const firebase = require('firebase');
const rp = require('request-promise');

const { config } = require('./config');
const response = require('./logic/response');

firebase.initializeApp(config);

// the action name from the generate_animal Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
const UNKNOWN_ACTION = 'unknown';
const EXIT_ACTION = 'exit';
// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';
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
 * Handle generate animal request
 */
function generateAnimal(app) {
  let context = generateContext(app, [
    ANIMAL1_ARGUMENT,
    ANIMAL2_ARGUMENT,
    ANIMAL3_ARGUMENT
  ]);
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
 * Actions on google mapping of handlers to actions
 */
const animixer = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generateAnimal);
  actionMap.set(UNKNOWN_ACTION, unknownAnimal);
  actionMap.set(EXIT_ACTION, exit);

  app.handleRequest(actionMap);
});

module.exports = {
  animixer
};
