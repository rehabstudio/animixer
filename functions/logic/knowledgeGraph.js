const fs = require('fs');
const rp = require('request-promise');
const utils = require('./utils');
const yaml = require('js-yaml');

// Animal type lookup
const animalData = yaml.safeLoad(
  fs.readFileSync('./copy/animals.yaml', 'utf-8')
);
const acceptableTypes = Object.keys(animalData.types);
const replacementAnimals = animalData.types;

function replacementAnimal(animalName) {
  let resultArray = [];
  let resultType;
  let found = false;
  return rp
    .get({
      url: 'https://kgsearch.googleapis.com/v1/entities:search',
      qs: {
        query: animalName,
        types: 'Thing',
        fields: 'itemListElement',
        key: 'AIzaSyAYqqXyXbUaqfMg_yAps3ZSLvld5inqVYY'
      },
      resolveWithFullResponse: true
    })
    .then(response => {
      const things = JSON.parse(response.body).itemListElement;
      things.forEach(thing => {
        if (
          acceptableTypes.includes(thing.result.description) &&
          resultArray.includes(thing.result.description) === false
        ) {
          resultArray.push(thing.result.description);
        }
      });
      if (resultArray.length > 0) {
        resultType = resultArray[0];
        found = true;
      } else {
        resultType = utils.randomSelection(acceptableTypes);
      }
      let replacement = utils.randomSelection(replacementAnimals[resultType]);
      return [found, replacement];
    });
}

module.exports = {
  replacementAnimal
};
