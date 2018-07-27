import Action from './action';
import globals from '../globals';

export default class Snackbar extends Action {
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
    globals.displaySnackbar(this.get('message'));
  }
}
