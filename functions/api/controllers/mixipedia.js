const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const animalFacts = require('./../../common/animalFacts');
const { config } = require('./../../config');
const firebase = require('./../../common/firebase');
const utils = require('./../../common/utils');

const animalData = yaml.safeLoad(
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
function createNewAnimalRecord(animal1, animal2, animal3) {
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
    gif_url: bucketUrl + config.storageBucket + '/gifs/' + gifName,
    image_url: bucketUrl + config.storageBucket + '/thumbnails/' + imageName,
    animal1: animal1,
    animal2: animal2,
    animal3: animal3,
    animalFact: animalFacts.generateFact(),
    animalVerb: animalData.verbs[animal1]
  };

  return database
    .ref('animals/')
    .orderByChild('name')
    .equalTo(animalName)
    .once('value')
    .then(snapshot => {
      let animalEntry = snapshot.val();
      if (animalEntry) {
        let animalKey = 'animals/' + Object.keys(animalEntry)[0];
        let updateObj = {};
        updateObj[animalKey] = animalObj;
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
      } else {
        return database
          .ref('animals/')
          .push(animalObj)
          .then(function() {
            console.info('Animal Written to DB: ' + animalName);
            return { success: 1 };
          })
          .catch(function(error) {
            console.error('Animal Write to DB failed: ' + animalName);
            return { success: 0, error: error };
          });
      }
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
 * Get animal data or create a new one then return data
 * @param  {[type]} animal1 [description]
 * @param  {[type]} animal2 [description]
 * @param  {[type]} animal3 [description]
 * @return {[type]}         [description]
 */
function getOrCreate(animal1, animal2, animal3) {
  return getAnimal(animal1, animal2, animal3).then(animalData => {
    if (animalData) {
      return animalData;
    } else {
      return createNewAnimalRecord(animal1, animal2, animal3).then(
        successJson => {
          return getAnimal(animal1, animal2, animal3).then(animalData => {
            return animalData;
          });
        }
      );
    }
  });
}

function mixipediaList(request, response) {
  let limit = request.query.limit || 10;
  let start = request.query.start;

  try {
    if (limit) {
      limit = parseInt(limit);
    }
    if (start) {
      start = parseInt(start);
    }
  } catch (err) {
    console.warn('Invalid start / limit value, int expected');
    limit = 10;
  }

  database
    .ref('/animals')
    .orderByChild('date_found_inv')
    .startAt(start)
    .limitToFirst(limit)
    .once('value')
    .then(function(snapshot) {
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(snapshot));
    })
    .catch(function(err) {
      console.error(err);
    });
}

function mixipediaPost(request, response) {
  const animal1 = request.body.animal1;
  const animal2 = request.body.animal2;
  const animal3 = request.body.animal3;

  if (!animal1 || !animal2 || !animal3) {
    return response
      .status(400)
      .send(JSON.stringify({ success: 0, error: 'Invalid animals' }));
  }

  return createNewAnimalRecord(animal1, animal2, animal3).then(successJson => {
    let status = successJson.success ? 200 : 500;
    response.set('Content-Type', 'application/json');
    response.status(status).send(JSON.stringify(successJson));
  });
}

function mixipediaGet(request, response) {
  const animal1 = request.params.animal1;
  const animal2 = request.params.animal2;
  const animal3 = request.params.animal3;

  return getAnimal(animal1, animal2, animal3).then(animalData => {
    response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.set('Content-Type', 'application/json');
    response.status(200).send(JSON.stringify(animalData));
  });
}

module.exports = {
  get: mixipediaGet,
  list: mixipediaList,
  post: mixipediaPost,
  createNewAnimalRecord: createNewAnimalRecord,
  getAnimal: getAnimal,
  getOrCreate: getOrCreate
};
