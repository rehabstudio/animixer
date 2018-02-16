/**
 * React Starter Kit for Firebase and GraphQL
 * https://github.com/kriasoft/react-firebase-starter
 * Copyright (c) 2015-present Kriasoft | MIT License
 */

/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import firebase from '@firebase/app';

import App from './components/App';
import history from './history';
import routes from './routes';
import registerServiceWorker from './registerServiceWorker';

firebase.initializeApp({
  apiKey: 'AIzaSyB9j98cQ4v_tu7mLr-gClzWxSNTmAOd8es',
  authDomain: 'animixer-1d266.firebaseapp.com',
  databaseURL: 'https://animixer-1d266.firebaseio.com',
  projectId: 'animixer-1d266',
  storageBucket: 'animixer-1d266.appspot.com',
  messagingSenderId: '74799871575'
});

const render = props =>
  new Promise((resolve, reject) => {
    try {
      ReactDOM.render(
        <App {...props} />,
        document.getElementById('root'),
        resolve(props)
      );
    } catch (err) {
      reject(err);
    }
  });

const resolve = location => {
  routes.resolve({
    pathname: location.pathname,
    location,
    render
  });
};

resolve(history.location); // InitializeApp
history.listen(resolve); // Listen for changes on client
registerServiceWorker();
