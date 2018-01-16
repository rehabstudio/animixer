process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const {
  RichResponse,
  BasicCard,
} = require('actions-on-google/response-builder');
const rp = require('request-promise');

const config = {
  apiKey: 'AIzaSyB9j98cQ4v_tu7mLr-gClzWxSNTmAOd8es',
  authDomain: 'animixer-1d266.firebaseapp.com',
  databaseURL: 'https://animixer-1d266.firebaseio.com',
  projectId: 'animixer-1d266',
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575',
};
const storage = googleStorage({
  projectId: config.projectId,
  keyFilename: 'animixer-pk.json',
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
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

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
    let animalName = animalHead + animalBody + animalLegs;

    // If image doesn't exist display animal not found dialog
    let imagePromise = rp({ uri: imageUrl, resolveWithFullResponse: true });
    //let audioPromise = rp({ uri: audioUrl, resolveWithFullResponse: true });
    let resp;

    Promise.all([imagePromise])
      .then(responses => {
        if (responses[0].statusCode === 200 && responses[0].statusCode == 200) {
          simpleResp.speech =
            '<speak>Congratulations, you have discovered the ' +
            animalName +
            '! I hope you like it. This is what it sounds like...' +
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
        simpleResp.speech = `<speak>No animal was found with: Head of ${animalHead},
        body of ${animalBody}, legs of ${animalLegs}, please try again.</speak>`;
        resp = new RichResponse().addSimpleResponse(simpleResp);

        app.tell(resp);
      });
  }
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);

  app.handleRequest(actionMap);
});
