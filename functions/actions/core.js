const App = require('actions-on-google').DialogflowApp;
const controllers = require('./controllers');

// the action names from the Dialogflow intent
const WELCOME_ACTION = 'input.welcome';
const RESTART_ACTION = 'restart';
const HEAD_ACTION = 'animal_head';
const BODY_ACTION = 'animal_body';
const GENERATE_ACTION = 'generate_animal';
const UNKNOWN_ACTION = 'unknown';
const EXIT_ACTION = 'exit';
const SURFACE_SWITCH_ACTION = 'new_surface_intent';
const CHANGE_ANIMAL_ACTION = 'change_value';
const SUGGESTION_ACTION = 'suggestion';

/**
 * Actions on google mapping of handlers to actions
 *
 * @param  {Object} request  Express like request object
 * @param  {Object} response Express like response object
 */
const actionsFn = function(request, response) {
  response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  // build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(WELCOME_ACTION, controllers.responses.welcome);
  actionMap.set(RESTART_ACTION, controllers.responses.restart);
  actionMap.set(HEAD_ACTION, controllers.animals.animalHead);
  actionMap.set(BODY_ACTION, controllers.animals.animalBody);
  actionMap.set(GENERATE_ACTION, controllers.animals.generateAnimal);
  actionMap.set(CHANGE_ANIMAL_ACTION, controllers.animals.changeAnimal);
  actionMap.set(SUGGESTION_ACTION, controllers.animals.suggestion);
  actionMap.set(SURFACE_SWITCH_ACTION, controllers.surface.surfaceSwitch);
  actionMap.set(EXIT_ACTION, controllers.misc.exit);
  actionMap.set(UNKNOWN_ACTION, controllers.animals.unknownAnimal);

  app.handleRequest(actionMap);
};

module.exports = actionsFn;
