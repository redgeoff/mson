// Note: babel-polyfill is needed by client for compilation
import 'babel-polyfill';

import app from './app';
import mson from '../mson-react';

// Render the app
mson.render(app);
