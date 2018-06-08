const utils = require('./../../common/utils');

/**
 * Generate animal name using animal syllables in copy .yaml files
 * @param  {Object} request  nodejs request object
 * @param  {Object} response nodejs response object
 */
function animalName(request, response) {
  const animal1 = request.query.animal1;
  const animal2 = request.query.animal2;
  const animal3 = request.query.animal3;
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);

  response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  response.set('Content-Type', 'application/json');
  response.status(200).send(
    JSON.stringify({
      animalName: animalName,
      prettyName: animalName.format()
    })
  );
}

module.exports = {
  get: animalName
};
