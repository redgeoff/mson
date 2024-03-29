import Action from './action';

export default class Set extends Action {
  className = 'Set';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'name',
            component: 'TextField',
          },
          {
            name: 'value',
            component: 'Field',
          },
          {
            name: 'target',
            component: 'Field',
          },
        ],
      },
    });
  }

  _setProp(props) {
    const name = this.get('name');
    let names = name ? name.split('.') : [];

    const thisValue = this.get('value');
    const value = thisValue === undefined ? props.arguments : thisValue;

    const thisTarget = this.get('target');
    const target = thisTarget === undefined ? props.component : thisTarget;

    if (!name) {
      // No name was specified, pipe to next action
      return value;
    } else if (names[0] === 'globals' || names[0] === 'component') {
      const first = names.splice(0, 1)[0]; // Remove globals or component
      if (first === 'globals') {
        this._globals.set({
          [names.join('.')]: value,
        });
      } else {
        target.set(value);
      }
    } else {
      target.set({
        [name]: value,
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
