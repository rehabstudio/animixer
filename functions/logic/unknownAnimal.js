const rp = require('request-promise');

function unknownAnimal(animalName) {
  // Animal type lookup
  const acceptableAnimals = ['chicken', 'crocodile', 'giraffe', 'monkey'];
  const acceptableTypes = ['Animal', 'Bird', 'Primate', 'Reptile'];
  const replacementAnimals = {
    Animal: 'giraffe',
    Bird: 'chicken',
    Primate: 'monkey',
    Reptile: 'crocodile',
  };
  const resultArray = [];
  let typeMatchResponse;
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
      const things = response.data.itemListElement;
      things.forEach(thing => {
        if (
          acceptableTypes.includes(thing.result.description) &&
          resultArray.includes(thing.result.description) == false
        ) {
          resultArray.push(thing.result.description);
        }
      });
      if (resultArray.length > 0) {
        const resultType = resultArray[0];
        typeMatchResponse = `I don’t know this ${resultType.toLowerCase()}, but I have a ${
          replacementAnimals[resultType]
        }`;
      } else {
        typeMatchResponse = `I don’t think that’s an animal. Try something else.`;
      }
      return typeMatchResponse;
    });
}

module.exports = {
  unknownAnimal,
};
