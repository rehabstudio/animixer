const {
  BasicCard,
  RichResponse
} = require('actions-on-google/response-builder');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const utils = require('./../../common/utils');
const knowledgeGraph = require('./../logic/knowledgeGraph');
const animalFacts = require('./../../common/animalFacts');
const userModel = require('./../../api/models/users');

const chimeSrc =
  'https://storage.googleapis.com/animixer-1d266.appspot.com/chime.ogg';

const responseData = yaml.safeLoad(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'copy/response.yaml'),
    'utf-8'
  )
);
const animalData = yaml.safeLoad(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'copy/animals.yaml'),
    'utf-8'
  )
);

/**
 * Used for formating response strings
 * @return {string} formated string with replaces variables
 */
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/\$\{(\d)\}/g, function(match, id) {
    return args[id];
  });
};

/**
 * Wrapper around app.ask to add end of response sound
 * NOTE: There is a max of 3 responses on a rich response so this might not
 * Add the end of response sound to large responses
 *
 * @param  {Object} {string} either object or response data
 */
function ask(app, response) {
  let resp;
  if (typeof response === 'string') {
    let speechStr =
      '<speak>' + response + `<audio src="${chimeSrc}"></audio>` + '</speak>';
    let respObj = {
      speech: speechStr
    };
    resp = new RichResponse();
    resp.addSimpleResponse(respObj);
  } else {
    resp = response;
  }
  app.ask(resp);
}

/**
 * Invalid animals recieved response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function animalsNotValid(app, context) {
  let resp = utils.randomSelection([
    responseData.animals_not_valid.text_1,
    responseData.animals_not_valid.text_2
  ]);
  return ask(app, resp);
}

/**
 * Invalid animals recieved response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function animalsIdentical(app, context) {
  let animalName = utils.capitalizeFirstLetter(context.animalHead);
  let imageUrl = utils.getImageUrl(context);
  let audioUrl = utils.getAudioUrl(context);
  let simpleResp = {};
  let aOrAn = utils.getAOrAn(animalName);
  let respData = responseData.animals_idential;
  let success = utils
    .randomSelection([respData.success_1, respData.success_2])
    .format(aOrAn, animalName);
  let restart = respData.restart;

  simpleResp.speech =
    '<speak>' +
    success +
    `<audio src="${audioUrl}"></audio>` +
    restart +
    '</speak>';

  let card = new BasicCard()
    .setTitle(animalName)
    .setImage(imageUrl, animalName)
    .setBodyText(`The ${context.animalHead}!`)
    .addButton(
      'Share me',
      `https://safarimixer.beta.rehab/animal/?animal1=${context.animalHead}` +
        `&animal2=${context.animalBody}&animal3=${context.animalLegs}`
    );
  let resp = new RichResponse()
    .addBasicCard(card)
    .addSimpleResponse(simpleResp);
  ask(app, resp);
}

/**
 * Welcome response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function welcome(app, context) {
  let resp;
  return userModel.getUserState(app).then(state => {
    if (state) {
      resp = responseData.welcome.text_2;
    } else {
      resp = responseData.welcome.text_1;
      // Creates empty state so we can recognise returning users
      userModel.setUserState(app, {});
    }
    return ask(app, resp);
  });
}

/**
 * restart response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function restart(app, context) {
  let resp = utils.randomSelection([responseData.restart.text_1]);
  return ask(app, resp);
}

/**
 * Animals head response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function animalHead(app, context) {
  let resp = utils
    .randomSelection([
      responseData.animal_head.text_1,
      responseData.animal_head.text_2
    ])
    .format(context.animalHead);
  return ask(app, resp);
}

/**
 * Animals body response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function animalBody(app, context) {
  let resp = utils
    .randomSelection([
      responseData.animal_body.text_1,
      responseData.animal_body.text_2
    ])
    .format(context.animalBody);
  return ask(app, resp);
}

/**
 * Send the generated animal response back to the chat bot
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function animalResponse(app, context) {
  let animalResp = {};
  let rediscoverResp = {};
  let resp;
  // Generate new animal name and search for its assets
  let animalName = utils.capitalizeFirstLetter(
    utils.makeAnimalName(
      context.animalHead,
      context.animalBody,
      context.animalLegs
    )
  );
  let animalVerb;
  let respData = responseData.animal_response;
  try {
    animalVerb = animalData.verbs[context.animalHead];
  } catch (err) {
    console.error('Animal verb not found for ' + context.animalHead);
    animalVerb = '';
  }

  let success = utils
    .randomSelection([respData.success_1, respData.success_2])
    .format(animalName, animalVerb);
  let rediscover = utils.randomSelection([
    respData.rediscover_1,
    respData.rediscover_2,
    respData.rediscover_3
  ]);
  let funFact;
  if (!context.animalData.animalFact) {
    funFact = animalFacts.generateFact();
  } else {
    funFact = context.animalData.animalFact;
  }

  animalResp.speech =
    '<speak>' +
    success +
    `<audio src="${context.audioUrl}"></audio> ` +
    respData.fun_fact.format(animalName, funFact) +
    '</speak>';
  rediscoverResp.speech =
    '<speak>' + rediscover + `<audio src="${chimeSrc}"></audio>` + '</speak>';

  let card = new BasicCard()
    .setTitle(animalName)
    .setImage(context.imageUrl, animalName)
    .setBodyText(
      respData.body.format(
        context.animalHead,
        context.animalBody,
        context.animalLegs
      )
    )
    .addButton(
      'Share me',
      `https://safarimixer.beta.rehab/animal/?animal1=${context.animalHead}` +
        `&animal2=${context.animalBody}&animal3=${context.animalLegs}`
    );
  resp = new RichResponse()
    .addSimpleResponse(animalResp)
    .addBasicCard(card)
    .addSimpleResponse(rediscoverResp);
  ask(app, resp);
}

/**
 * Create switch screen message
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function screenSwitch(app, context) {
  let animalName = utils.capitalizeFirstLetter(
    utils.makeAnimalName(
      context.animalHead,
      context.animalBody,
      context.animalLegs
    )
  );
  let respData = responseData.screen_switch;
  let text = respData.text;
  let notif = respData.notif.format(animalName);
  app.askForNewSurface(text, notif, [app.SurfaceCapabilities.SCREEN_OUTPUT]);
}

/**
 * Send the exit response and close the conversation with the bot
 *
 * @param  {Object} app     app actions on google app object
 */
function exitResponse(app) {
  app.tell(responseData.exit.text);
}

/**
 * Send the animal not found response to the chat bot
 *
 * @param  {Object} app     app actions on google app object
 */
function notFoundResponse(app) {
  let resp = responseData.not_found.text;

  ask(app, resp);
}

/**
 * Return response asking for next value depending on missing arguments
 *
 * @param  {Object} app     app actions on google app object
 * @param  {Object} context parsed values from dialog flow
 */
function changeAnimal(app, context) {
  let animalMap = {
    head: 'animalHead',
    body: 'animalBody',
    legs: 'animalLegs'
  };
  let respData = responseData.changeAnimal;
  let verb = context.changed === 'legs' ? 'were' : 'was';
  let newValue = context[animalMap[context.changed]];
  let aOrAn = utils.getAOrAn(newValue);
  let response = respData.text.format(context.changed, verb, aOrAn, newValue);

  if (!context.animalHead) {
    response += respData.missing_head;
  } else if (!context.animalBody) {
    response += respData.missing_body;
  } else if (!context.animalLegs) {
    response += respData.missing_legs;
  }
  ask(app, response);
}

/**
 * Use knowledge graph to generate an unknown animal response
 *
 * @param  {Object} app     app actions on google app object
 * @param  {string} noun    noun from user input
 */
function unknownAnimalResponse(app, noun) {
  let respData = responseData.unknownAnimalResponse;
  return knowledgeGraph
    .replacementAnimal(noun)
    .then(results => {
      let found = results[0];
      let replacement = results[1];
      let unknownResponse;
      let unknown;
      let aOrAn = utils.getAOrAn(replacement);

      if (found) {
        unknown = utils.randomSelection([
          respData.unknown_animal_1,
          respData.unknown_animal_2
        ]);
        unknownResponse = unknown.format(aOrAn, replacement);
      } else {
        unknown = utils.randomSelection([
          respData.unknown_1,
          respData.unknown_2,
          respData.unknown_3
        ]);
        unknownResponse = unknown.format(aOrAn, replacement);
      }
      app.setContext('unknown', 1, {
        noun: noun,
        suggestion: replacement
      });
      ask(app, unknownResponse);
    })
    .catch(err => {
      let unknownResponse = respData.unknown_error;
      ask(app, unknownResponse);
    });
}

module.exports = {
  animalBody,
  animalHead,
  animalsIdentical,
  animalsNotValid,
  animalResponse,
  changeAnimal,
  exitResponse,
  notFoundResponse,
  restart,
  screenSwitch,
  unknownAnimalResponse,
  welcome
};
