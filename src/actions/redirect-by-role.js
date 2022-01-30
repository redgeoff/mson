import Action from './action';
import utils from '../utils';

export default class RedirectByRole extends Action {
  className = 'RedirectByRole';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'routes',
            component: 'Field',
            required: true,
          },
        ],
      },
    });

    this._setDefaults(props, { layer: 'frontEnd' });
  }

  async act() {
    const routes = this.get('routes');
    utils.each(routes, (route) => {
      if (!route.roles || this._registrar.client.user.hasRole(route.roles)) {
        this._globals.redirect(route.path);
        return false; // exit loop
      }
    });
  }
}
