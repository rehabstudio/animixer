const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const utils = require('./utils');

const animalFacts = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, '..', 'copy/animalFacts.yaml'), 'utf-8')
);

/**
 * Generate a random fact using animal fact copy which will pick a random
 * fact then substitute a random value into it
 *
 * @return {string} random fact string
 */
function generateFact(animal) {
  let randomFact;
  if (animal && animalFacts[animal] !== undefined) {
    randomFact = utils.randomSelection(animalFacts[animal]);
  } else {
    randomFact = utils.randomSelection(animalFacts.facts);
  }
  let factVariableName = /\${([^}]+)}/g.exec(randomFact);
  let factVariable;
  if (factVariableName) {
    factVariable = utils.randomSelection(animalFacts[factVariableName[1]]);
    randomFact = randomFact.replace(factVariableName[0], factVariable);
  }
  return randomFact;
}

module.exports = {
  generateFact
};
