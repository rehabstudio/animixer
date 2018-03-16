const Twitter = require('twitter');
const { twitterConfig } = require('./../config');

const client = new Twitter(twitterConfig);
var rp = require('request-promise');

/**
 * Post image and status to the animixer twitter account
 * @param  {string} status string to upload to use as a status update
 * @param  {sting} image  url of image to upload
 * @return {Promise}      Return promise of status of image upload and image details
 */
function postTweetImage(status, image) {
  console.info('Posting image to twitter');
  return uploadImage(image)
    .then(data => {
      if (!data) throw new Error('No image data returned');
      let params = { status: status, media_ids: data.media_id_string };
      return client.post('statuses/update', params).then(data => {
        console.info('Animal posted to Twitter: ', status);
        return data;
      });
    })
    .catch(err => {
      console.error('Unable to upload image ', err);
      return err;
    });
}

/**
 * Upload image to twitter to use with twitter post
 * @param  {[type]} image [description]
 * @return {Promise}      Return promise of status of image upload and image details
 */
function uploadImage(image) {
  let config = {
    method: 'GET',
    uri: image,
    resolveWithFullResponse: true,
    encoding: null
  };
  return rp(config)
    .then(response => {
      if (response.statusCode === 200) {
        let body = response.body;
        return client.post('media/upload', { media: body });
      } else {
        throw new Error('Unexpected statusCode:', response.statusCode);
      }
    })
    .catch(err => {
      console.error(
        'Error uploading image to twitter: ',
        image,
        err,
        err.message
      );
      return Promise.resolve();
    });
}

module.exports = {
  postTweetImage
};
