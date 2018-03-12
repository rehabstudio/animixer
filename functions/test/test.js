process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const httpMocks = require('./async-http-mocks');
const sinon = require('sinon');
const { config } = require('./../config');
const testData = require('./testData');

const assert = chai.assert;
chai.use(chaiAsPromised);

describe('Cloud Functions', () => {
  let smFunctions, configStub, adminInitStub, functions, admin;

  // eslint-disable-next-line no-undef
  before(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns({
      firebase: config
    });
    smFunctions = require('../index');
  });

  // eslint-disable-next-line no-undef
  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });

  describe('actions', () => {
    it('Should return a random welcome message', done => {
      let body = JSON.parse(JSON.stringify(testData.dialogFlowWelcomeData));
      let context = {
        name: 'startanimal',
        parameters: {},
        lifespan: 5
      };
      body.result.contexts.push(context);
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/actions',
        headers: {
          'content-type': 'application/json; charset=UTF-8'
        },
        body: body
      });
      let response = httpMocks.createResponse();
      let expectedResult =
        '<speak>Welcome back explorer! Which type of animal head should we look for?' +
        '<audio src="https://storage.googleapis.com/animixer-1d266.appspot.com/chime.ogg"></audio></speak>';
      response.on('end', function(body) {
        assert.equal(body.speech, expectedResult);
        assert.equal(response.statusCode, 200);
        done();
      });
      smFunctions.actions(request, response);
    });

    it('Should return accept an animal head message', done => {
      let body = JSON.parse(JSON.stringify(testData.dialogFlowWelcomeData));
      let context = {
        name: 'animalhead',
        parameters: {
          animalHead: 'tiger',
          adjectives: []
        },
        lifespan: 10
      };
      body.result.action = 'animal_head';
      body.resolvedQuery = 'tiger';
      body.result.parameters.animalHead = 'tiger';
      body.result.contexts.splice(0, 0, context);
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/actions',
        headers: {
          'content-type': 'application/json; charset=UTF-8'
        },
        body: body
      });
      let response = httpMocks.createResponse();
      let expectedResults = [
        '<speak>We’re looking for something with the head of a wild tiger - how unusual. ' +
          'What body does it have?<audio src="https://storage.googleapis.com/animixer-1d266.appspot.com/chime.ogg"></audio></speak>',
        '<speak>We’re looking for something with the head of a wild tiger! What body does it have?' +
          '<audio src="https://storage.googleapis.com/animixer-1d266.appspot.com/chime.ogg"></audio></speak>'
      ];
      response.on('end', function(body) {
        assert.include(expectedResults, body.speech);
        assert.equal(response.statusCode, 200);
        done();
      });
      smFunctions.actions(request, response);
    });
  });

  it('Should handle no animal gracefully', done => {
    let body = JSON.parse(JSON.stringify(testData.dialogFlowWelcomeData));
    let context = {
      name: 'animalhead',
      parameters: {
        animalHead: 'tiger',
        adjectives: []
      },
      lifespan: 10
    };
    body.result.action = 'animal_head';
    body.resolvedQuery = '';
    body.result.parameters.animalHead = '';
    body.result.contexts.splice(0, 0, context);
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/actions',
      headers: {
        'content-type': 'application/json; charset=UTF-8'
      },
      body: body
    });
    let response = httpMocks.createResponse();
    let expectedResults = [
      "<speak>I'm sorry I didn't understand can you please try saying that another way?" +
        '<audio src="https://storage.googleapis.com/animixer-1d266.appspot.com/chime.ogg"></audio></speak>'
    ];
    response.on('end', function(body) {
      assert.include(expectedResults, body.speech);
      assert.equal(response.statusCode, 200);
      done();
    });
    smFunctions.actions(request, response);
  });
});
