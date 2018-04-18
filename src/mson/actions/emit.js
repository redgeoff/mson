import Action from './action';

export default class Emit extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'event', 'value');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'event', 'value');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    props.component._emitChange(this.get('event'), this.get('value'));
  }
}
