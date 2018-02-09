const utils = require('./../../common/utils');
const { config } = require('./../../config');
const firebase = require('./../../common/firebase');
const database = firebase.database();

const bucketUrl = 'https://storage.googleapis.com/';

function mixipediaGet(request, response) {
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
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);
  if (!animalName) {
    return response
      .status(400)
      .send(JSON.stringify({ success: 0, error: 'Invalid animals' }));
  }
  let gifName = animal1 + '_' + animal2 + '_' + animal3 + '_render.gif';

  database
    .ref('animals/')
    .push({
      name: animalName,
      found: true,
      date_found: new Date().getTime(),
      date_found_inv: new Date().getTime() * -1,
      gif_url: bucketUrl + config.storageBucket + '/' + gifName,
      animal1: animal1,
      animal2: animal2,
      animal3: animal3
    })
    .then(function() {
      console.info('Animal Written to DB: ' + animalName);
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify({ success: 1 }));
    })
    .catch(function(error) {
      console.error('Animal Write to DB failed: ' + animalName);
      response.set('Content-Type', 'application/json');
      response.status(500).send(JSON.stringify({ success: 0, error: error }));
    });
}

module.exports = {
  get: mixipediaGet,
  post: mixipediaPost
};