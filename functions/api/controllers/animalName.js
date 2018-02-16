const utils = require('./../../common/utils');

function animalName(request, response) {
  const animal1 = request.query.animal1;
  const animal2 = request.query.animal2;
  const animal3 = request.query.animal3;
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);

  response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  response.set('Content-Type', 'application/json');
  response.status(200).send(JSON.stringify({ animalName }));
}

module.exports = {
  get: animalName
};
