const rp = require('request-promise');
const utils = require('./utils');

function unknownAnimal(animalName) {
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
      'zebra',
    ],
    Bird: ['chicken', 'flamingo', 'duck', 'ostrich'],
    Primate: ['gorilla'],
    Reptile: ['crocodile', 'frog', 'tortoise'],
  };
  const resultArray = [];
  let typeMatchResponse;
  console.log('animalName:', animalName);
  return rp
    .get({
      url: 'https://kgsearch.googleapis.com/v1/entities:search',
      qs: {
        query: animalName,
        types: 'Thing',
        fields: 'itemListElement',
        key: 'AIzaSyAYqqXyXbUaqfMg_yAps3ZSLvld5inqVYY',
      },
      resolveWithFullResponse: true,
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
        const resultType = resultArray[0];
        const replacement = utils.randomSelection(
          replacementAnimals[resultType],
        );
        typeMatchResponse = `I haven’t seen a ${resultType.toLowerCase()} on this safari. How about a ${replacement}?`;
      } else {
        const resultType = utils.randomSelection([
          'Animal',
          'Bird',
          'Primate',
          'Reptile',
        ]);
        const replacement = utils.randomSelection(
          replacementAnimals[resultType],
        );
        typeMatchResponse = `That doesn’t seem to be an animal. How about a ${replacement}`;
      }
      return typeMatchResponse;
    });
}

module.exports = {
  unknownAnimal,
};
