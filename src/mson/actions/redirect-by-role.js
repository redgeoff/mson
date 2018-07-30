import Action from './action';
import globals from '../globals';
import registrar from '../compiler/registrar';
import _ from 'lodash';

export default class RedirectByRole extends Action {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'routes',
            component: 'Field',
            required: true
          }
        ]
      }
    });

    this._setDefaults(props, { layer: 'frontEnd' });
  }

  async act() {
    const routes = this.get('routes');
    _.each(routes, route => {
      if (!route.roles || registrar.client.user.hasRole(route.roles)) {
        globals.redirect(route.path);
        return false; // exit loop
      }
    });
  }
}
