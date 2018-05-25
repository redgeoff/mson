import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import '../mson/register-client';
import registrar from '../mson/compiler/registrar';

// Make sure we load the session before doing any rendering so that components can do their initial
// rendering based on the user's authentication status
registrar.client.user.getSession().then(function() {
  ReactDOM.render(<App />, document.getElementById('root'));
  registerServiceWorker();
});
