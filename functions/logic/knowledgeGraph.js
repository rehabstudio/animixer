const rp = require('request-promise');
const utils = require('./utils');

// Animal type lookup
const acceptableTypes = ['Animal', 'Bird', 'Primate', 'Reptile'];
const replacementAnimals = {
  Animal: [
    'antelope',
    'buffalo',
    'dog',
    'elephant',
    'giraffe',
    'hippo',
    'hyena',
    'leopard',
    'lion',
    'pony',
    'puma',
    'rhinoceros',
    'tiger',
    'warthog',
    'wildebeest',
    'zebra'
  ],
  Bird: ['chicken', 'flamingo', 'duck', 'ostrich'],
  Primate: ['gorilla'],
  Reptile: ['crocodile', 'frog', 'tortoise']
};

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
