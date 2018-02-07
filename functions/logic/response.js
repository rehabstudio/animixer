const {
  RichResponse,
  BasicCard
} = require('actions-on-google/response-builder');
const fs = require('fs');
const yaml = require('js-yaml');
const utils = require('./utils');
const knowledgeGraph = require('./knowledgeGraph');
const responseData = yaml.safeLoad(
  fs.readFileSync('./copy/response.yaml', 'utf-8')
);
const animalData = yaml.safeLoad(
  fs.readFileSync('./copy/animals.yaml', 'utf-8')
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
 * Invalid animals recieved response
 */
function animalsNotValid(app, context) {
  return app.ask(responseData.animals_not_valid.text);
}

/**
 * Invalid animals recieved response
 */
function animalsIdentical(app, context) {
  let animalName = context.animalHead;
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
      'share',
      `https://animixer.beta.rehab/animal/?animal1=${context.animalHead}` +
        `&animal2=${context.animalBody}&animal3=${context.animalLegs}`
    );
  let resp = new RichResponse()
    .addBasicCard(card)
    .addSimpleResponse(simpleResp);
  app.ask(resp);
}

/**
 * Send the generated animal response back to the chat bot
 */
function animalResponse(app, context) {
  let simpleResp = {};
  let resp;
  // Generate new animal name and search for its assets
  let animalName = utils.makeAnimalName(
    context.animalHead,
    context.animalBody,
    context.animalLegs
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
    respData.rediscover_2
  ]);

  simpleResp.speech =
    '<speak>' +
    success +
    `<audio src="${context.audioUrl}"></audio>` +
    rediscover +
    '</speak>';
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
      'share',
      `https://animixer.beta.rehab/animal/?animal1=${context.animalHead}` +
        `&animal2=${context.animalBody}&animal3=${context.animalLegs}`
    );
  resp = new RichResponse().addBasicCard(card).addSimpleResponse(simpleResp);
  app.ask(resp);
}

/**
 * Create switch screen message
 */
function screenSwitch(app, context) {
  let animalName = utils.makeAnimalName(
    context.animalHead,
    context.animalBody,
    context.animalLegs
  );
  let respData = responseData.screen_switch.format(animalName);
  let text = responseData.text;
  let notif = responseData.notif;
  app.askForNewSurface(text, notif, [app.SurfaceCapabilities.SCREEN_OUTPUT]);
}

/**
 * Send the animal not found response to the chat bot
 */
function notFoundResponse(app) {
  let simpleResp = {};
  let resp;
  let respData = responseData.screen_switch;
  simpleResp.speech = `<speak>${respData.text}</speak>`;
  resp = new RichResponse().addSimpleResponse(simpleResp);

  app.ask(resp);
}

/**
 * Send the exit response and close the conversation with the bot
 */
function exitResponse(app) {
  app.tell(responseData.exit.text);
}

/**
 * Use knowledge graph to generate an unknown animal response
 */
function unknownAnimalResponse(app, noun) {
  return knowledgeGraph.replacementAnimal(noun).then(results => {
    let found = results[0];
    let replacement = results[1];
    let simpleResp = {};
    let resp;
    let respData = responseData.unknownAnimalResponse;
    let unknownResponse;
    let aOrAn = utils.getAOrAn(replacement);

    if (found) {
      unknownResponse = respData.unknown_1.format(noun, aOrAn, replacement);
    } else {
      unknownResponse = respData.unknown_2.format(aOrAn, replacement);
    }
    simpleResp.speech = `<speak>${unknownResponse}</speak>`;
    resp = new RichResponse().addSimpleResponse(simpleResp);
    app.ask(resp);
  });
}

/**
 * Return response asking for next value depending on missing arguments
 */
function changeAnimal(app, context) {
  let simpleResp = {};
  let animalMap = {
    head: 'animalHead',
    body: 'animalBody',
    legs: 'animalLegs'
  };
  let respData = responseData.changeAnimal;
  let verb = context.changed === 'legs' ? 'were' : 'was';
  let newValue = context[animalMap[context.changed]];
  let aOrAn = utils.getAOrAn(newValue);
  let response = responseData.text.format(
    context.changed,
    verb,
    aOrAn,
    newValue
  );

  if (!context.animalHead) {
    response += respData.missing_head;
  } else if (!context.animalBody) {
    response += respData.missing_body;
  } else if (!context.animalLegs) {
    response += respData.missing_legs;
  }
  simpleResp.speech = `<speak>${response}</speak>`;
  let resp = new RichResponse().addSimpleResponse(simpleResp);
  app.ask(resp);
}

module.exports = {
  animalsIdentical,
  animalsNotValid,
  animalResponse,
  changeAnimal,
  exitResponse,
  notFoundResponse,
  screenSwitch,
  unknownAnimalResponse
};
