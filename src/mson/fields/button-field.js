import Field from './field';

export default class ButtonField extends Field {
  _create(props) {
    super._create(props);
    this.set({ block: false, out: false });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'icon');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'icon');
    return value === undefined ? super.getOne(name) : value;
  }

  emitClick() {
    this._emitChange('click');
  }
}
