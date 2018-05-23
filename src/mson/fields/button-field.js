import Field from './field';

export default class ButtonField extends Field {
  _create(props) {
    super._create(props);
    this.set({ block: false, out: false });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'icon', 'variant');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'icon', 'variant');
    return value === undefined ? super.getOne(name) : value;
  }

  emitClick() {
    this._emitChange('click');

    if (this.get('type') === 'submit') {
      // Disable to prevent the user from clicking the button again before the action has completed
      this.set({ disabled: true });
    }
  }
}
