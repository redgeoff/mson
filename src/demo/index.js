// Note: babel-polyfill is needed by client for compilation
import 'babel-polyfill';

import _ from 'lodash';
import compiler from '../mson/compiler';
import * as components from './components';
import mson from '../mson-react';
import globals from '../mson/globals';

// Set the site key when using the ReCAPTCHAField
globals.set({ reCAPTCHASiteKey: 'TODO' });

// Register all the components
_.forEach(components, component =>
  compiler.registerComponent(component.name, component)
);

// Instantiate the app
const app = compiler.newComponent({
  component: 'app.App'
});

// Render the app
mson.render(app);
