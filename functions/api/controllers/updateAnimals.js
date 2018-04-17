const firebase = require('./../../common/firebase');
const animalsFn = require('./../models/animals');
const twitter = require('./../../triggers/twitter');
const database = firebase.database();

/**
 * Helper API endpoint to refresh all animals if schema changes
 * @param  {Object} request  nodejs request object
 * @param  {Object} response nodejs response object
 */
function updateAnimals(request, response) {
  database
    .ref('/animals')
    .once('value')
    .then(function(snapshot) {
      let animals = snapshot.val();
      Object.keys(animals).forEach(animalKey => {
        let animal = animals[animalKey];
        animalsFn.createNewAnimalRecord(
          animal.animal1,
          animal.animal2,
          animal.animal3,
          animal
        );
      });
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(snapshot));
    })
    .catch(function(err) {
      console.error(err);
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.status(500).send('Error updating animals');
    });
}

/**
 * Helper API endpoint to post all unposted animals to twitter
 * @param  {Object} request  nodejs request object
 * @param  {Object} response nodejs response object
 */
function postAnimalsTwitter(request, response) {
  database
    .ref('/animals')
    .once('value')
    .then(function(snapshot) {
      let animals = snapshot.val();
      Object.keys(animals).forEach(animalKey => {
        let animalData = animals[animalKey];
        let mockEvent = {
          data: {
            val: () => {
              return animalData;
            }
          }
        };
        twitter.postAnimal(mockEvent);
      });
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.status(200).send('Success');
    })
    .catch(function(err) {
      console.error(err);
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.status(500).send('Error posting animals to twitter');
    });
}

/**
 * Helper API endpoint to make amendments to animals disabled by default
 * @param  {Object} request  nodejs request object
 * @param  {Object} response nodejs response object
 */
function modifyAnimals(request, response) {
  database
    .ref('/animals')
    .once('value')
    .then(function(snapshot) {
      let animals = snapshot.val();
      Object.keys(animals).forEach(animalKey => {
        let animal = animals[animalKey];
        animal['tweetImage'] = null;
        animalsFn.updateAnimal(animal.name, animal);
      });
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(snapshot));
    })
    .catch(function(err) {
      console.error(err);
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.status(500).send('Error updating animals');
    });
}

module.exports = {
  modifyAnimals,
  postAnimalsTwitter,
  updateAnimals
};
