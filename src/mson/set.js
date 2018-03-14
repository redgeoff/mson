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

  _setProp(props) {
    const name = this.get('name');
    let names = name.split('.');
    if (names.length === 1) {
      props.component.set({
        [name]: this.get('value')
      });
    } else {
      let component = props.component.get(names[0]);
      for (let i = 1; i < names.length - 1; i++) {
        component = component.get(names[i]);
      }
      component.set({
        [names[names.length - 1]]: this.get('value')
      });
    }
  }

  async act(props) {
    this._setProp(props);
  }
}
