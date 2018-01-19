process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const path = require('path');
const {
  RichResponse,
  BasicCard,
} = require('actions-on-google/response-builder');
const rp = require('request-promise');
const unknownAnimal = require('./logic/unknownAnimal');
const { config } = require('./config');
const utils = require('./logic/utils');

firebase.initializeApp(config);

// the action name from the generate_animal Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
const UNKNOWN_ACTION = 'unknown';
// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';
const UNKNOWN_ARGUMENT = 'noun';

function unknown(app) {
  let noun = app.getArgument(UNKNOWN_ARGUMENT);
  unknownAnimal.unknownAnimal(noun).then(unknownResp => {
    let simpleResp = {};
    let resp;
    simpleResp.speech = `<speak>${unknownResp}</speak>`;
    resp = new RichResponse().addSimpleResponse(simpleResp);
    app.tell(resp);
  });
}

function generateContext(app) {
  let context = {};
  let args = [ANIMAL1_ARGUMENT, ANIMAL2_ARGUMENT, ANIMAL3_ARGUMENT];
  // Refresh context
  for (let i = 0; i < args.length; i++) {
    context[args[i]] = app.getArgument(args[i]);
  }

  return context;
}

/**
 * Generate animal response using 3 animals passed from google assistant
 */
function generate(app) {
  let context = generateContext(app);
  let simpleResp = {};
  let resp;

  // Generate new animal name and search for its assets
  let animalName = utils.makeAnimalName(
    context.animalHead,
    context.animalBody,
    context.animalLegs,
  );
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
  let success_msg_1 = `Congratulations, you’ve found the wild ${animalName}! This is what is sounds like…`;
  let success_msg_2 = `Congratulations, you’ve just discovered the mysterious ${animalName}! Hear it...`;

  // Wait for assets to be found
  Promise.all([imagePromise])
    .then(responses => {
      if (responses[0].statusCode === 200 && responses[0].statusCode === 200) {
        simpleResp.speech =
          '<speak>' +
          utils.randomSelection([success_msg_1, success_msg_2]) +
          `<audio src="${audioUrl}"></audio>` +
          '</speak>';
        let card = new BasicCard()
          .setTitle(animalName)
          .setImage(imageUrl, animalName);
        resp = new RichResponse()
          .addSimpleResponse(simpleResp)
          .addBasicCard(card);

        app.tell(resp);
      } else {
        throw 'Animal content not found';
      }
    })
    .catch(err => {
      simpleResp.speech = `<speak>I haven’t discovered that animal yet on this safari. How about trying a different combination?</speak>`;
      resp = new RichResponse().addSimpleResponse(simpleResp);

      app.tell(resp);
    });
}

const animixer = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);
  actionMap.set(UNKNOWN_ACTION, unknown);

  app.handleRequest(actionMap);
});

module.exports = {
  animixer,
};
