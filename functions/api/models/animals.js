const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const animalFacts = require('./../../common/animalFacts');
const { firebaseConfig } = require('./../../config');
const firebase = require('./../../common/firebase');
const utils = require('./../../common/utils');

const animalYamlData = yaml.safeLoad(
  fs.readFileSync(
    path.join(__dirname, '..', '..', 'copy/animals.yaml'),
    'utf-8'
  )
);
const bucketUrl = 'https://storage.googleapis.com/';
const database = firebase.database();

/**
 * Create / Update animal record in firebase realtime database
 * @param  {string} animal1
 * @param  {string} animal2
 * @param  {string} animal3
 */
function createUpdateAnimal(animal1, animal2, animal3, additionalData) {
  additionalData = additionalData || {};
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);
  if (!animalName) {
    return { success: 0, error: 'Invalid animals' };
  }
  let gifName = animal1 + '_' + animal2 + '_' + animal3 + '_render.gif';
  let imageName = animal1 + '_' + animal2 + '_' + animal3 + '_thumbnail.png';
  let animalObj = {
    name: animalName,
    found: true,
    date_found: new Date().getTime(),
    date_found_inv: new Date().getTime() * -1,
    gif_url: bucketUrl + firebaseConfig.storageBucket + '/gifs/' + gifName,
    image_url:
      bucketUrl + firebaseConfig.storageBucket + '/thumbnails/' + imageName,
    animal1: animal1,
    animal2: animal2,
    animal3: animal3,
    animalFact: animalFacts.generateFact(animal1),
    animalVerb: animalYamlData.verbs[animal1]
  };
  Object.assign(animalObj, additionalData);

  return database
    .ref('animals/')
    .orderByChild('name')
    .equalTo(animalName)
    .once('value')
    .then(snapshot => {
      let animalEntry = snapshot.val();
      if (animalEntry) {
        return updateAnimal(animalName, animalObj);
      } else {
        return createAnimal(animalName, animalObj);
      }
    });
}

/**
 * Update animal record in firebase realtime database
 * @param  {string} animalName animal name to use as key in db
 * @param  {object} animalData animal data to save in db
 * @return {Promise}           Promise object to resolve when db action complete
 */
function updateAnimal(animalName, animalData) {
  let animalKey = 'animals/' + animalName;
  let updateObj = {};
  updateObj[animalKey] = animalData;
  return database
    .ref()
    .update(updateObj)
    .then(function() {
      console.info('Animal Updated in DB: ' + animalName);
      return { success: 1 };
    })
    .catch(function(error) {
      console.error('Animal Update in DB failed: ' + animalName);
      return { success: 0, error: error };
    });
}

/**
 * Create animal record in firebase realtime database
 * @param  {string} animalName animal name to use as key in db
 * @param  {object} animalData animal data to save in db
 * @return {Promise}           Promise object to resolve when db action complete
 */
function createAnimal(animalName, animalData) {
  return database
    .ref('animals/' + animalName)
    .set(animalData)
    .then(function() {
      console.info('Animal Written to DB: ' + animalName);
      return { success: 1 };
    })
    .catch(function(error) {
      console.error('Animal Write to DB failed: ' + animalName);
      return { success: 0, error: error };
    });
}

/**
 * Get Animal data for mixed animal
 * @param  {[type]} animal1 [description]
 * @param  {[type]} animal2 [description]
 * @param  {[type]} animal2 [description]
 * @return {[type]}         [description]
 */
function getAnimal(animal1, animal2, animal3) {
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);

  return database
    .ref('animals/')
    .orderByChild('name')
    .equalTo(animalName)
    .once('value')
    .then(snapshot => {
      let animalEntry = snapshot.val();
      if (animalEntry) {
        let animalKey = Object.keys(animalEntry)[0];
        return animalEntry[animalKey];
      }
      return animalEntry;
    });
}

/**
 * Check if animal exists and create it if not create a new one then return data
 * @param  {string} animal1 animal string to build animal name with
 * @param  {string} animal2 animal string to build animal name with
 * @param  {string} animal3 animal string to build animal name with
 * @return {Promise}        Promise containing animal data object
 */
function getOrCreate(animal1, animal2, animal3) {
  return getAnimal(animal1, animal2, animal3).then(animalData => {
    if (animalData) {
      return animalData;
    } else {
      return createUpdateAnimal(animal1, animal2, animal3).then(successJson => {
        return getAnimal(animal1, animal2, animal3).then(animalData => {
          return animalData;
        });
      });
    }
  });
}

/**
 * Update animal data or create a new one then return data
 * @param  {string} animal1 animal string to build animal name with
 * @param  {string} animal2 animal string to build animal name with
 * @param  {string} animal3 animal string to build animal name with
 * @return {Promise}        Promise containing animal data object
 */
function UpdateOrCreate(animal1, animal2, animal3) {
  return getAnimal(animal1, animal2, animal3).then(animalData => {
    if (animalData) {
      animalData.date_found = new Date().getTime();
      animalData.date_found_inv = new Date().getTime() * -1;
      return updateAnimal(animalData.name, animalData).then(successJson => {
        return animalData;
      });
    } else {
      return createUpdateAnimal(animal1, animal2, animal3).then(successJson => {
        return getAnimal(animal1, animal2, animal3).then(animalData => {
          return animalData;
        });
      });
    }
  });
}

module.exports = {
  createAnimal,
  createUpdateAnimal,
  getAnimal,
  getOrCreate,
  updateAnimal,
  UpdateOrCreate
};
