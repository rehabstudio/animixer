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
  let success_msg_1 = `Congratulations, you’ve found the wild ${animalName}! This is what is sounds like…`;
  let success_msg_2 = `Congratulations, you’ve just discovered the mysterious ${animalName}! Hear it...`;

  simpleResp.speech =
    '<speak>' +
    utils.randomSelection([success_msg_1, success_msg_2]) +
    `<audio src="${context.audioUrl}"></audio>` +
    'What an unusual animal. Would you like to discover another one?' +
    '</speak>';
  let card = new BasicCard()
    .setTitle(animalName)
    .setImage(context.imageUrl, animalName);
  resp = new RichResponse().addBasicCard(card).addSimpleResponse(simpleResp);
  app.ask(resp);
}

/**
 * Send the animal not found response to the chat bot
 */
function notFoundResponse(app) {
  let simpleResp = {};
  let resp;
  simpleResp.speech = `<speak>I haven’t discovered that animal yet on this safari. How about trying a different combination?</speak>`;
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
  unknownAnimalResponse
};
