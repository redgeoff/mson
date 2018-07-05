import Action from './action';
import globals from '../globals';

export default class Set extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'name', 'value');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'name', 'value');
    return value === undefined ? super.getOne(name) : value;
  }

  // For mocking
  _getGlobals() {
    return globals;
  }

  _setProp(props) {
    const name = this.get('name');
    let names = name !== null ? name.split('.') : [];

    const value =
      this.get('value') === null
        ? props.arguments
        : this.getFilled('value', props);

    if (!name) {
      // No name was specified to so pipe to next action
      return value;
    } else if (names.length === 1) {
      props.component.set({
        [name]: value
      });
    } else {
      let component =
        names[0] === 'globals'
          ? this._getGlobals()
          : props.component.get(names[0]);
      for (let i = 1; i < names.length - 1; i++) {
        component = component.get(names[i]);
      }
      component.set({
        [names[names.length - 1]]: value
      });
    }

    // Pipe the arguments so that we can do things like use multiple Set actions to copy pieces of
    // our API results
    return props.arguments;
  }

  async act(props) {
    return this._setProp(props);
  }
}
