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

function randomSelection(values) {
  return values[Math.floor(Math.random() * values.length)];
}

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

function verifyAnimals(animalHead, animalBody, animalLegs) {
  let noHead_1 = 'We can see a head of something but what is it?';
  let noBody_1 = `Something’s moving in the bushes. It looks like a ${animalHead}. What body does it have?`;
  let noBody_2 = `Yes, there’s something with the head of a ${animalHead}. What body does it have?`;
  let nolegs_1 = `The body of a ${animalBody} - that’s a rare animal. And what legs does it have?`;
  let nolegs_2 = `No-one’s seen an animal like this before with the body of a ${animalLegs}.  And what legs does it have?`;

  // Check that we have the animal

  if (animalHead === null) {
    return noHead_1;
  } else if (animalBody === null) {
    return randomSelection([noBody_1, noBody_2]);
  } else if (animalLegs === null) {
    return randomSelection([nolegs_1, nolegs_2]);
  }
  return null;
}

/**
 * Generate animal response using 3 animals passed from google assistant
 */
function generate(app) {
  let animalHead = app.getArgument(ANIMAL1_ARGUMENT);
  let animalBody = app.getArgument(ANIMAL2_ARGUMENT);
  let animalLegs = app.getArgument(ANIMAL3_ARGUMENT);
  let simpleResp = {};
  let resp;
  let context = {
    animalHead: animalHead,
    animalBody: animalBody,
    animalLegs: animalLegs,
  };
  let test = app.getContextArgument('animals', 'animalHead');
  console.log('test:', test);
  app.setContext('animals', 3, context);
  let response = verifyAnimals(animalHead, animalBody, animalLegs);
  if (response) {
    simpleResp.speech = `<speak>${response}</speak>`;
    resp = new RichResponse().addSimpleResponse(simpleResp);
    app.tell(resp);
    return;
  }
  let imageName =
    animalHead + '_' + animalBody + '_' + animalLegs + '_render.gif';
  let audioName = animalHead + '_' + animalBody + '.wav';
  let imageUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${imageName}`;
  let audioUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${audioName}`;
  let animalName = makeAnimalName(animalHead, animalBody, animalLegs);
  // If image doesn't exist display animal not found dialog
  let imagePromise = rp({ uri: imageUrl, resolveWithFullResponse: true });
  //let audioPromise = rp({ uri: audioUrl, resolveWithFullResponse: true });
  let success_msg_1 = `Congratulations, you’ve found the wild ${animalName}! This is what is sounds like…`;
  let success_msg_2 = `Congratulations, you’ve just discovered the mysterious ${animalName}! Hear it...`;

  Promise.all([imagePromise])
    .then(responses => {
      if (responses[0].statusCode === 200 && responses[0].statusCode == 200) {
        simpleResp.speech =
          '<speak>' +
          randomSelection([success_msg_1, success_msg_2]) +
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

const animxer = functions.https.onRequest((request, response) => {
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(GENERATE_ACTION, generate);

  app.handleRequest(actionMap);
});

module.exports = {
  animxer,
};
