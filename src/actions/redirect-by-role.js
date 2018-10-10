import Action from './action';
import each from 'lodash/each';

export default class RedirectByRole extends Action {
  _className = 'RedirectByRole';

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
    each(routes, route => {
      if (!route.roles || this._registrar.client.user.hasRole(route.roles)) {
        this._globals.redirect(route.path);
        return false; // exit loop
      }
    });
  }
}
