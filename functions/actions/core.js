const App = require('actions-on-google').DialogflowApp;
const controllers = require('./controllers');

// the action names from the Dialogflow intent
const GENERATE_ACTION = 'generate_animal';
const UNKNOWN_ACTION = 'unknown';
const EXIT_ACTION = 'exit';
const SURFACE_SWITCH_ACTION = 'new_surface_intent';
const CHANGE_ANIMAL_ACTION = 'change_value';

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
  actionMap.set(GENERATE_ACTION, controllers.animals.generateAnimal);
  actionMap.set(UNKNOWN_ACTION, controllers.animals.unknownAnimal);
  actionMap.set(CHANGE_ANIMAL_ACTION, controllers.animals.changeAnimal);
  actionMap.set(SURFACE_SWITCH_ACTION, controllers.surface.surfaceSwitch);
  actionMap.set(EXIT_ACTION, controllers.misc.exit);

  app.handleRequest(actionMap);
};

module.exports = actionsFn;
