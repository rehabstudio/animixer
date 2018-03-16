const twitter = require('./../twitter');
const animals = require('./../api/models/animals');

/**
 * Post an animal on twitter and then add it's twitter image link to the animal
 * data in the DB
 * @param  {Object} event Firebase database event
 * @return {Promise}      Promise which will resolve when the operation is complete
 */
function postAnimal(event) {
  console.info('Post animal trigger started');
  let animalData = event.data.val();

  if (!animalData.tweetImage) {
    return twitter.api
      .postTweetImage(
        `The ${animalData.name} has been discovered!`,
        animalData.image_url
      )
      .then(tweetData => {
        console.log('Updating animal data');
        let imageUrl = tweetData.entities.media[0].url;
        return animals.createUpdateAnimal(
          animalData.animal1,
          animalData.animal2,
          animalData.animal3,
          { tweetImage: imageUrl }
        );
      });
  } else {
    console.info('Animal already posted to twitter, skipping');
    return Promise.resolve();
  }
}

/**
 * Wraps trigger function above to allow us to debug / test it
 * @param  {Object} request  nodejs request object
 * @param  {Object} response nodejs response object
 */
function postAnimalRequest(request, response) {
  let mockEvent = {
    data: {
      val: () => {
        return {
          animal1: 'gorilla',
          animal2: 'tiger',
          animal3: 'lion',
          animalFact: 'they have sticky orange bogies.',
          animalVerb: 'chatter',
          date_found: 1521127109712,
          date_found_inv: -1521127109712,
          found: true,
          gif_url:
            'https://storage.googleapis.com/animixer-1d266.appspot.com/gifs/gorilla_tiger_lion_render.gif',
          image_url:
            'https://storage.googleapis.com/animixer-1d266.appspot.com/thumbnails/gorilla_tiger_lion_thumbnail.png',
          name: 'gorigeion'
        };
      }
    }
  };
  postAnimal(mockEvent).then(successJson => {
    response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    response.set('Content-Type', 'application/json');
    response.status(200).send(JSON.stringify(successJson));
  });
}

module.exports = {
  postAnimal,
  postAnimalRequest
};
