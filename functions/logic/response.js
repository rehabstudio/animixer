const {
  RichResponse,
  BasicCard
} = require('actions-on-google/response-builder');
const utils = require('./utils');
const knowledgeGraph = require('./knowledgeGraph');

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
  let success1 = `Congratulations, you’ve found the wild ${animalName}! This is what is sounds like…`;
  let success2 = `Congratulations, you’ve just discovered the mysterious ${animalName}! Hear it...`;
  let rediscover1 =
    'What an unusual animal. Would you like to discover another one?';
  let rediscover2 =
    'There are lots more hiding. Would you like to find another animal?';

  let imageName = context.imageUrlsplit('/')[
    context.imageUrlsplit('/').length - 1
  ];
  simpleResp.speech =
    '<speak>' +
    utils.randomSelection([success1, success2]) +
    `<audio src="${context.audioUrl}"></audio>` +
    utils.randomSelection([rediscover1, rediscover2]) +
    '</speak>';
  let card = new BasicCard()
    .setTitle(animalName)
    .setImage(context.imageUrl, animalName)
    .setBodyText(
      `Head of ${context.animalHead}, body of ${
        context.animalBody
      } and legs of ${context.animalLegs}`
    )
    .addButton(
      'share',
      `https://animixer.beta.rehab/animal/?animalName=${animalName}&imageUrl=${imageName}`
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
  let text = `Would you like me to send a picture of the ${animalName} to your phone?`;
  let notif = 'Your unique animal!';
  app.askForNewSurface(text, notif, [app.SurfaceCapabilities.SCREEN_OUTPUT]);
}

/**
 * Send the animal not found response to the chat bot
 */
function notFoundResponse(app) {
  let simpleResp = {};
  let resp;
  simpleResp.speech = `<speak>I haven’t discovered that animal yet on this safari. Would you like to try a different combination?</speak>`;
  resp = new RichResponse().addSimpleResponse(simpleResp);

  app.ask(resp);
}

/**
 * Send the exit response and close the conversation with the bot
 */
function exitResponse(app) {
  app.tell('Come back to the Animixer safari any time.');
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
    let unknownResponse;

    if (found) {
      unknownResponse = `I haven’t seen a wild ${noun} on this safari. How about the ${replacement}?`;
    } else {
      unknownResponse = `That doesn’t seem to be an animal. How about the ${replacement}?`;
    }
    simpleResp.speech = `<speak>${unknownResponse}</speak>`;
    resp = new RichResponse().addSimpleResponse(simpleResp);
    app.ask(resp);
  });
}

module.exports = {
  animalResponse,
  exitResponse,
  notFoundResponse,
  screenSwitch,
  unknownAnimalResponse
};
