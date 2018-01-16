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

const storage = googleStorage({
  projectId: config.projectId,
  keyFilename: path.resolve('../animixer-pk.json'),
});
const bucket = storage.bucket(config.storageBucket);

firebase.initializeApp(config);

// the action name from the generate_animal Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';

const animalSyllables = {
  chicken: ['chick', 'ick', 'ken'],
  crocodile: ['croc', 'oco', 'dile'],
  elephant: ['ele', 'epha', 'phant'],
  giraffe: ['gir', 'ira', 'raffe'],
  rhinoceros: ['rhin', 'oçe', 'ros'],
  tiger: ['ti', 'ige', 'ger'],
};

/**
 * Create new animal name from list of hardcoded animal Syllables
 */
function makeAnimalName(head, body, legs) {
  function getSyllable(animal, index) {
    if (animalSyllables[animal] !== undefined) {
      return animalSyllables[animal][index];
    } else {
      return animal;
    }
  }
  return getSyllable(head, 0) + getSyllable(body, 1) + getSyllable(legs, 2);
}

/**
 * Generate animal response using 3 animals passed from google assistant
 */
function generate(app) {
  let animalHead = app.getArgument(ANIMAL1_ARGUMENT);
  let animalBody = app.getArgument(ANIMAL2_ARGUMENT);
  let animalLegs = app.getArgument(ANIMAL3_ARGUMENT);
  let imageName =
    animalHead + '_' + animalBody + '_' + animalLegs + '_render.gif';
  let audioName = animalHead + '_' + animalBody + '.wav';
  let imageUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${imageName}`;
  let audioUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${audioName}`;
  let simpleResp = {};
  let animalName = makeAnimalName(animalHead, animalBody, animalLegs);

  // If image doesn't exist display animal not found dialog
  let imagePromise = rp({ uri: imageUrl, resolveWithFullResponse: true });
  //let audioPromise = rp({ uri: audioUrl, resolveWithFullResponse: true });
  let resp;

  Promise.all([imagePromise])
    .then(responses => {
      if (responses[0].statusCode === 200 && responses[0].statusCode == 200) {
        simpleResp.speech =
          '<speak>Congratulations, you’ve just discovered the mysterious ' +
          animalName +
          '! Hear it ROAR' +
          '<audio src="' +
          audioUrl +
          '">' +
          "(sound didn't load)" +
          '</audio></speak>';
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
      simpleResp.speech =
        `<speak>No animal was found with: Head of a ${animalHead}, ` +
        `body of a ${animalBody}, legs of a ${animalLegs}, please try again.</speak>`;
      resp = new RichResponse().addSimpleResponse(simpleResp);

      app.tell(resp);
    });
}

exports.generateAnimal = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);

  app.handleRequest(actionMap);
});
