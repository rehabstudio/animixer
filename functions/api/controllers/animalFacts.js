const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const utils = require('./../../common/utils');
const animalFacts = require('./../../common/animalFacts');

const responseData = yaml.safeLoad(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'copy/response.yaml'),
    'utf-8'
  )
);

function animalFact(request, response) {
  const animal1 = request.query.animal1;
  const animal2 = request.query.animal2;
  const animal3 = request.query.animal3;
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);
  let funFact = animalFacts.generateFact();
  let respData = responseData.animal_response;
  let respString = respData.fun_fact.format(animalName, funFact);
  let respObj = {};

  if (!animalName) {
    respObj = {
      error: 'No animal found',
      animalFact: ''
    };
  } else {
    respObj = { animalFact: respString };
  }

  response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  response.set('Content-Type', 'application/json');
  response.status(200).send(JSON.stringify(respObj));
}

module.exports = {
  get: animalFact
};
