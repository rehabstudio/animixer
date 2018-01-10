'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const {
  RichResponse,
  BasicCard
} = require('actions-on-google/response-builder');

const config = {
  apiKey: "AIzaSyB9j98cQ4v_tu7mLr-gClzWxSNTmAOd8es",
  authDomain: "animixer-1d266.firebaseapp.com",
  databaseURL: "https://animixer-1d266.firebaseio.com",
  projectId: "animixer-1d266",
  storageBucket: "animixer-1d266.appspot.com",
  messagingSenderId: "74799871575"
};
const storage = googleStorage({
  projectId: config.projectId,
  keyFilename: "animixer-pk.json"
});
const bucket = storage.bucket(config.storageBucket);

firebase.initializeApp(config);

// the action name from the generate_animal Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
// the parameters that are parsed from the generate_animal intent
const ANIMAL1_ARGUMENT = 'animalHead';
const ANIMAL2_ARGUMENT = 'animalBody';
const ANIMAL3_ARGUMENT = 'animalLegs';


exports.generateAnimal = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  function generate (app) {
    let animalHead = app.getArgument(ANIMAL1_ARGUMENT);
    let animalBody = app.getArgument(ANIMAL2_ARGUMENT);
    let animalLegs = app.getArgument(ANIMAL3_ARGUMENT);
    let imageName = 'trex.jpg';
    let imageUrl = `https://storage.googleapis.com/${config.storageBucket}/${imageName}`;

    let simpleResp = {};
    let animalName = animalHead + animalBody + animalLegs;
    simpleResp.speech = ('<speak>Alright, your animal is ' +
      animalName +
      '! I hope you like it. This is what it sounds like...' +
      '<audio src="https://actions.google.com/sounds/v1/animals/cat_purr_close.ogg">' +
        '<desc>a cat purring</desc>' +
        'PURR (sound didn\'t load)' +
      '</audio></speak>');
    let card = new BasicCard().setTitle(animalName).setImage(imageUrl, animalName);
    let resp = new RichResponse().addSimpleResponse(simpleResp).addBasicCard(card);

    app.tell(resp);
  }
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);

  app.handleRequest(actionMap);
});
