const utils = require('./../../common/utils');

const firebase = require('./../../common/firebase');
const database = firebase.database();

function mixipediaGet(request, response) {
  database
    .ref('/animals')
    .once('value')
    .then(function(snapshot) {
      console.log(snapshot);
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(snapshot));
    })
    .catch(function(err) {
      console.error(err);
    });
}

function mixipediaPost(request, response) {
  const animal1 = request.query.animal1;
  const animal2 = request.query.animal2;
  const animal3 = request.query.animal3;
  let animalName = utils.makeAnimalName(animal1, animal2, animal3);

  database
    .ref('animals/' + animalName)
    .set({
      found: true,
      date_found: new Date()
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
