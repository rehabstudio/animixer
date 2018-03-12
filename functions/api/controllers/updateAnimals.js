const firebase = require('./../../common/firebase');
const mixipedia = require('./mixipedia');
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
        mixipedia.createNewAnimalRecord(
          animal.animal1,
          animal.animal2,
          animal.animal3
        );
      });
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(snapshot));
    })
    .catch(function(err) {
      console.error(err);
    });
}

module.exports = {
  get: updateAnimals
};
