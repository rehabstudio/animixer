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
  rhinoceros: ['snuffle'],
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

module.exports = {
  animalVerbs,
  makeAnimalName,
  randomSelection
};
