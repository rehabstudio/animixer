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

// a. the action name from the make_name Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
// b. the parameters that are parsed from the make_name intent
const ANIMAL1_ARGUMENT = 'animal1';
const ANIMAL2_ARGUMENT = 'animal2';
const ANIMAL3_ARGUMENT = 'animal3';


exports.generateAnimal = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function generate (app) {
    let animal1 = app.getArgument(ANIMAL1_ARGUMENT);
    let animal2 = app.getArgument(ANIMAL2_ARGUMENT);
    let animal3 = app.getArgument(ANIMAL3_ARGUMENT);
    let imageName = 'trex.jpg';
    let imageUrl = `https://storage.googleapis.com/${config.storageBucket}/${imageName}`;

    let simpleResp = {};
    let animalName = animal1 + animal2 + animal3;
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
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);

  app.handleRequest(actionMap);
});
