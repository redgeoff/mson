import Action from './action';
import globals from '../globals';

export default class Redirect extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'path');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'path');
    return value === undefined ? super.getOne(name) : value;
  }

  async act() {
    globals.redirect(this.get('path'));
  }
}
