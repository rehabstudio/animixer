const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');

const animalFactApi = require('./controllers/animalFacts');
const animalNameApi = require('./controllers/animalName');
const mixipediaApi = require('./controllers/mixipedia');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Add middleware to authenticate requests
//app.use(myMiddleware);

// animal fact endpoint
app.get('/animalFact', animalFactApi.get);

// animal name endpoint
app.get('/animalName', animalNameApi.get);

// mixipedia API endpoints
app.get('/mixipedia', mixipediaApi.get);
app.post('/mixipedia', mixipediaApi.post);

module.exports = app;
