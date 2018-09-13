// A sanity test of the UI. TODO: create proper tests for mson-react layer (see
// mson-react/fields/field.test.js) and then require 100% coverage.

import './firebase-mock';
import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from '../mson-react/app-container';
import app from './app';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AppContainer app={app} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
