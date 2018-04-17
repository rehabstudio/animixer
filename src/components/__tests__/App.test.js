import React from 'react';
import ReactDOM from 'react-dom';
import App from './../App';
import Home from './../../routes/Home';

it('renders without crashing', () => {
  const homeDiv = document.createElement('div');
  const appDiv = document.createElement('div');
  const route = { body: '' };
  ReactDOM.render(<App location="/" route={route} />, appDiv);
});
