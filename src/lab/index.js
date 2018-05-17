import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import '../mson/register-client';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
