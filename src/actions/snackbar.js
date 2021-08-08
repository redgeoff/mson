import Action from './action';

export default class Snackbar extends Action {
  className = 'Snackbar';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'message',
            component: 'TextField',
            required: true,
          },
        ],
      },
    });

    this._setDefaults(props, { layer: 'frontEnd' });
  }

  async act(props) {
    this._globals.displaySnackbar(this.get('message'));
  }
}
