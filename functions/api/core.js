const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');

const animalFactApi = require('./controllers/animalFacts');
const animalNameApi = require('./controllers/animalName');
const mixipediaApi = require('./controllers/mixipedia');
const updateAnimalsApi = require('./controllers/updateAnimals');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// animal fact endpoint
app.get('/animalFact', animalFactApi.get);

// animal name endpoint
app.get('/animalName', animalNameApi.get);

// mixipedia API endpoints
app.get('/mixipedia', mixipediaApi.list);
app.get('/mixipedia/:animal1/:animal2/:animal3', mixipediaApi.get);
app.post('/mixipedia', mixipediaApi.post);

// Update animals API endpoints
app.get('/updateAnimals', updateAnimalsApi.updateAnimals);
app.get('/postAnimalsTwitter', updateAnimalsApi.postAnimalsTwitter);

module.exports = app;
