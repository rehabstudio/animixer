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
 * Invalid animals recieved response
 */
function animalsIdentical(app, context) {
  let animalName = context.animalHead;
  let imageUrl = utils.getImageUrl(context);
  let simpleResp = {};
  let aOrAn = utils.getAOrAn(animalName);
  let success1 =
    `Congratulations, you’ve just discovered… ${aOrAn} ${animalName}! ` +
    'There are some amazing mixed up animals here. Let’s see what else is hiding.';
  let success2 =
    `There’s something hiding over there. It’s… ${aOrAn} ${animalName}! ` +
    'There are some really unusual animals on this safari. Let’s find a new one.';
  let restart = 'To start, what head does your animal have?';

  simpleResp.speech =
    '<speak>' +
    utils.randomSelection([success1, success2]) +
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
  try {
    animalVerb = utils.animalVerbs[context.animalHead][0];
  } catch (err) {
    console.error('Animal verb not found for ' + context.animalHead);
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
    let aOrAn = utils.getAOrAn(replacement);

    if (found) {
      unknownResponse = `I haven’t seen a wild ${noun} on this safari. How about ${aOrAn} ${replacement}?`;
    } else {
      unknownResponse = `That doesn’t seem to be an animal. How about ${aOrAn} ${replacement}?`;
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
  let verb = context.changed === 'legs' ? 'were' : 'was';
  let newValue = context[animalMap[context.changed]];
  let aOrAn = utils.getAOrAn(newValue);
  let response =
    'Yes, I can see it now! Looks like the ' +
    `${context.changed} ${verb} actually ${aOrAn} ${newValue}!`;

  if (!context.animalHead) {
    response += 'And what head does it have?';
  } else if (!context.animalBody) {
    response += 'And what body does it have?';
  } else if (!context.animalLegs) {
    response += 'And what legs does it have?';
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
