const {
  RichResponse,
  BasicCard
} = require('actions-on-google/response-builder');
const utils = require('./utils');
const knowledgeGraph = require('./knowledgeGraph');

/**
 * Invalid animals recieved response
 */
function animalsNotValid(app, context) {
  return app.ask(
    "I've never seen an animal with the same head body or legs, would you like to look again?"
  );
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
  try {
    animalVerb = utils.animalVerbs[context.animalHead][0];
  } catch (err) {
    animalVerb = '';
  }

  let success1 = `Congratulations, you’ve found the wild ${animalName}! This is what is sounds like… `;
  let success2 = `Congratulations, you’ve just discovered the mysterious ${animalName}! Hear it ${animalVerb}... `;
  let rediscover1 =
    'What an unusual animal. Would you like to discover another one?';
  let rediscover2 =
    'There are lots more hiding. Would you like to find another animal?';

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
  let response = `I was mistaken, looks like the ${
    context.changed
  } was actually the ${context[animalMap[context.changed]]}! `;

  if (!context.animalHead) {
    response += 'Now I can see its head but what is it?';
  } else if (!context.animalBody) {
    response += 'Now I can see its body but what is it?';
  } else if (!context.animalLegs) {
    response += 'Now I can see its legs but what are they?';
  }
  simpleResp.speech = `<speak>${response}</speak>`;
  let resp = new RichResponse().addSimpleResponse(simpleResp);
  app.ask(resp);
}

module.exports = {
  animalsNotValid,
  animalResponse,
  changeAnimal,
  exitResponse,
  notFoundResponse,
  screenSwitch,
  unknownAnimalResponse
};
