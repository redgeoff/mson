import Action from './action';

export default class Set extends Action {
  _className = 'Set';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'name',
            component: 'TextField'
          },
          {
            name: 'value',
            component: 'Field'
          }
        ]
      }
    });
  }

  _setProp(props) {
    const name = this.get('name');
    let names = name ? name.split('.') : [];

    const thisValue = this.get('value');
    const value = thisValue === undefined ? props.arguments : thisValue;

    if (!name) {
      // No name was specified to so pipe to next action
      return value;
    } else if (names.length === 1) {
      props.component.set({
        [name]: value
      });
    } else {
      let component =
        names[0] === 'globals' ? this._globals : props.component.get(names[0]);
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
