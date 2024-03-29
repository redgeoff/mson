import Action from './action';

export default class Redirect extends Action {
  className = 'Redirect';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'path',
            component: 'TextField',
            required: true,
          },
        ],
      },
    });

    this._setDefaults(props, { layer: 'frontEnd' });
  }

  async act() {
    this._globals.redirect(this.get('path'));
  }
}
