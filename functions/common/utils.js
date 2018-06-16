const { firebaseConfig } = require('./../config');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const animalData = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, '..', 'copy/animals.yaml'), 'utf-8')
);
const animalSyllables = animalData.syllables;

/**
 * Capitalize first letter of string
 * @type {string} input string
 * @return {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
  if (!string) {
    return;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Capitalize every word in string
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function titleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Randomly return one item from array
 * @param  {array} values array of values to pick from
 * @return {any} randomly selected values from array
 */
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
  if (head === body && body === legs) {
    return head;
  } else {
    return getSyllable(head, 0) + getSyllable(body, 1) + getSyllable(legs, 2);
  }
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
    firebaseConfig.storageBucket
  }/gifs/${imageName}`;
  return imageUrl;
}

/**
 * Generate audio url from context object
 */
function getAudioUrl(context) {
  let audioName;
  if (context.animalHead !== context.animalBody) {
    audioName =
      [context.animalHead, context.animalBody].sort().join('') + '.wav';
  } else {
    audioName = context.animalHead + '.wav';
  }
  let audioUrl = `https://storage.googleapis.com/${
    firebaseConfig.storageBucket
  }/sounds/${audioName}`;
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
  capitalizeFirstLetter,
  getAOrAn,
  getAudioUrl,
  getImageUrl,
  makeAnimalName,
  randomSelection,
  titleCase
};
