const cors = require('cors');
const express = require('express');

const animalNameApi = require('./controllers/animalName');
const mixipediaApi = require('./controllers/mixipedia');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
//app.use(myMiddleware);

// animal name endpoint
app.get('/animalName', animalNameApi.get);

// mixipedia API endpoints
app.get('/mixipedia', mixipediaApi.get);
app.post('/mixipedia', mixipediaApi.post);

module.exports = app;
