import Action from './action';
import globals from '../globals';

export default class Snackbar extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'message');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'message');
    return value === undefined ? super.getOne(name) : value;
  }

  async act() {
    globals.displaySnackbar(this.get('message'));
  }
}
