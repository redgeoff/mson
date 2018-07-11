// TODO: remove this file after the app is loaded via the components stored in the DB

import compiler from '../mson/compiler';
import globals from '../mson/globals';
import * as components from '../employees/components';
import _ from 'lodash';

// TODO: in a production app the appId should be set by the path or subdomain
globals.set({ appId: 101 });

// TODO: properly set
globals.set({ reCAPTCHASiteKey: '6LdIbGMUAAAAAJnipR9t-SnWzCbn0ZX2myXBIauh' });

_.forEach(components, component =>
  compiler.registerComponent(component.name, component)
);

const app = compiler.newComponent({
  component: 'app.App'
});

export default app;
