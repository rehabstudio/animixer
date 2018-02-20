const fs = require('fs');
const path = require('path');
const rp = require('request-promise');
const utils = require('./../../common/utils');
const yaml = require('js-yaml');

// Animal type lookup
const animalData = yaml.safeLoad(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'copy/animals.yaml'),
    'utf-8'
  )
);
const acceptableTypes = Object.keys(animalData.types);
const replacementAnimals = animalData.types;

/**
 * Make API call to google knowledge graph to categorise the unknown
 * user input to try and identify it if it's an animal, return a
 * known animal if the user inputs an unknown animal.
 *
 * @param  {string} animalName string inputted by user to pass to knowledge graph
 * @return {array} array with boolean true if animal and a replacement string value
 */
function replacementAnimal(animalName) {
  let resultArray = [];
  let resultType;
  let found = false;
  // Make call to knowldge graph
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
      // parse response and add to results array if user input is an animal type
      const things = JSON.parse(response.body).itemListElement;
      things.forEach(thing => {
        let description;
        if (thing.result.description) {
          description = thing.result.description.toLowerCase();
        }
        if (
          acceptableTypes.includes(description) &&
          resultArray.includes(description) === false
        ) {
          resultArray.push(description);
        }
      });
      // if item in results array then return animal of same type
      if (resultArray.length > 0) {
        resultType = resultArray[0];
        found = true;
      } else {
        resultType = utils.randomSelection(acceptableTypes);
      }
      // randomly suggest animal of type resultType
      let replacement = utils.randomSelection(replacementAnimals[resultType]);
      return [found, replacement];
    });
}

module.exports = {
  replacementAnimal
};
