const twitter = require('./../twitter');
const animals = require('./../api/models/animals');

function postAnimal(event) {
  console.log('Post animal trigger started');
  let animalData = event.data.val();
  console.log('animalData', animalData);

  return twitter.api.postTweetImage(
    `The ${animalData.name} has been discovered!`,
    animalData.image_url)
    .then((tweetData) => {
      animals.createUpdateAnimal(
        animalData.animal1,
        animalData.animal2,
        animalData.animal3,
        {tweetImage: 'https://' + tweetData.text.split('https://')[1]}
      );
    });
}

function postAnimalRequest(request, response) {
  let mockEvent = {
    data : {
      val : () => {
        return {
          animal1: 'gorilla',
          animal2: 'tiger',
          animal3: 'lion',
          animalFact: 'they have sticky orange bogies.',
          animalVerb: 'chatter',
          date_found: 1521127109712,
          date_found_inv: -1521127109712,
          found: true,
          gif_url: 'https://storage.googleapis.com/animixer-1d266.appspot.com/gifs/gorilla_tiger_lion_render.gif',
          image_url: 'https://storage.googleapis.com/animixer-1d266.appspot.com/thumbnails/gorilla_tiger_lion_thumbnail.png',
          name: 'gorigeion'
        };
      }
    }
  }
  postAnimal(mockEvent)
    .then((successJson) => {
      response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      response.set('Content-Type', 'application/json');
      response.status(200).send(JSON.stringify(successJson));
    });
}

module.exports = {
  postAnimal,
  postAnimalRequest
};
