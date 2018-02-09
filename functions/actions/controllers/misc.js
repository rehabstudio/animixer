const responses = require('./responses');

/**
 * Handle good bye message and close conversation
 */
function exit(app) {
  responses.exitResponse(app);
}

module.exports = {
  exit
};
