import Action from './action';

export default class Snackbar extends Action {
  _className = 'Snackbar';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'message',
            component: 'TextField',
            required: true
          }
        ]
      }
    });

    this._setDefaults(props, { layer: 'frontEnd' });
  }

  async act(props) {
    this._globals.displaySnackbar(this.get('message'));
  }
}
