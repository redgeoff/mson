import Action from './action';

export default class Set extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'name', 'value');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'name', 'value');
    return value === undefined ? super.getOne(name) : value;
  }

  _setOnComponent(component, name, value) {
    if (typeof value === 'object') {
      component.set(value);
    } else {
      component.set({ [name]: value });
    }
  }

  _setProp(props) {
    const name = this.get('name');
    let names = name !== null ? name.split('.') : [];
    const value =
      this.get('value') === null ? props.arguments : this.get('value');
    if (!name) {
      // No name was specified to so pipe to next action
      return value;
    } else if (names.length === 1) {
      this._setOnComponent(props.component, name, value);
    } else {
      let component = props.component.get(names[0]);

      const length =
        typeof value === 'object' ? names.length : names.length - 1;

      for (let i = 1; i < length; i++) {
        component = component.get(names[i]);
      }

      this._setOnComponent(component, names[names.length - 1], value);
    }
  }

  async act(props) {
    return this._setProp(props);
  }
}
