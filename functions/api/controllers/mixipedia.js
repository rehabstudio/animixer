const firebase = require('./../../common/firebase');
const animals = require('./../models/animals');
const database = firebase.database();

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
      let data = snapshot.val();
      Object.keys(data).forEach(function(key) {
        data[key].prettyName = data[key].name.format();
      });
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(data));
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

  return animals
    .createNewAnimalRecord(animal1, animal2, animal3)
    .then(successJson => {
      let status = successJson.success ? 200 : 500;
      response.set('Content-Type', 'application/json');
      response.status(status).send(JSON.stringify(successJson));
    });
}

function mixipediaGet(request, response) {
  const animal1 = request.params.animal1;
  const animal2 = request.params.animal2;
  const animal3 = request.params.animal3;

  return animals.getAnimal(animal1, animal2, animal3).then(animalData => {
    animalData.prettyName = animalData.name.format();
    response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.set('Content-Type', 'application/json');
    response.status(200).send(JSON.stringify(animalData));
  });
}

module.exports = {
  get: mixipediaGet,
  list: mixipediaList,
  post: mixipediaPost
};
