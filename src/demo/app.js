import _ from 'lodash';
import compiler from '../mson/compiler';
import * as components from './components';
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

export default app;
