const { config } = require('./../config');

const animalSyllables = {
  antelope: ['ant', 'elo', 'lope'],
  buffalo: ['buff', 'uffa', 'lo'],
  chicken: ['chick', 'ick', 'ken'],
  crocodile: ['croc', 'oco', 'dile'],
  dog: ['do', 'o', 'g'],
  duck: ['d', 'uc', 'ck'],
  elephant: ['ele', 'epha', 'phant'],
  flamingo: ['flam', 'ami', 'mingo'],
  frog: ['fr', 'o', 'g'],
  giraffe: ['gir', 'ira', 'raffe'],
  gorilla: ['gorr', 'illa', 'rilla'],
  hippo: ['hipp', 'opota', 'tamus'],
  hyena: ['hy', 'ena', 'yena'],
  leopard: ['leop', 'opa', 'pard'],
  lion: ['li', 'i', 'on'],
  ostrich: ['ostr', 'ich', 'ich'],
  pony: ['p', 'on', 'ny'],
  puma: ['p', 'um', 'ma'],
  pussycat: ['puss', 'ussy', 'cat'],
  rhinoceros: ['rhin', 'oçe', 'ros'],
  tiger: ['ti', 'ige', 'ger'],
  tortoise: ['tort', 'oi', 'se'],
  warthog: ['wart', 'art', 'hog'],
  wildebeest: ['wild', 'ebe', 'beest'],
  zebra: ['zeb', 'ebra', 'bra']
};

const animalVerbs = {
  antelope: ['bleet'],
  buffalo: ['moo'],
  chicken: ['cock-a-doodle-doo'],
  crocodile: ['snap'],
  dog: ['bark'],
  duck: ['quack'],
  elephant: ['trumpet'],
  flamingo: ['squawk'],
  frog: ['ribbit'],
  giraffe: ['hum'],
  gorilla: ['chatter'],
  hippo: ['grunt'],
  hyena: ['laugh'],
  leopard: ['growl'],
  lion: ['roar'],
  ostrich: ['squawk'],
  pony: ['neigh'],
  puma: ['growl'],
  pussycat: ['meow'],
  rhino: ['snuffle'],
  tiger: ['growl'],
  tortoise: ['mutter'],
  warthog: ['oink'],
  wildebeest: ['bellow'],
  zebra: ['neigh']
};

function randomSelection(values) {
  return values[Math.floor(Math.random() * values.length)];
}

/**
 * Create new animal name from list of hardcoded animal Syllables
 */
function makeAnimalName(head, body, legs) {
  function getSyllable(animal, index) {
    if (animalSyllables[animal] !== undefined) {
      return animalSyllables[animal][index];
    } else {
      return animal;
    }
  }
  return getSyllable(head, 0) + getSyllable(body, 1) + getSyllable(legs, 2);
}

/**
 * Generate image url from context object
 */
function getImageUrl(context) {
  let imageName =
    context.animalHead +
    '_' +
    context.animalBody +
    '_' +
    context.animalLegs +
    '_render.gif';
  let imageUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${imageName}`;
  return imageUrl;
}

/**
 * Generate audio url from context object
 */
function getAudioUrl(context) {
  let audioName =
    [context.animalHead, context.animalBody].sort().join('') + '.wav';
  let audioUrl = `https://storage.googleapis.com/${
    config.storageBucket
  }/${audioName}`;
  return audioUrl;
}

/**
 * Grammer helper function
 */
function getAOrAn(noun) {
  let vowels = ['a', 'e', 'i', 'o', 'u'];
  if (vowels.indexOf(noun[0].toLowerCase()) > -1) {
    return 'an';
  }
  return 'a';
}

module.exports = {
  animalVerbs,
  getAOrAn,
  getAudioUrl,
  getImageUrl,
  makeAnimalName,
  randomSelection
};
