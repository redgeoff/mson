import Action from './action';

export default class JSONStringify extends Action {
  _className = 'JSONStringify';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'value',
            component: 'Field'
          },
          {
            name: 'space',
            component: 'IntegerField'
          }
        ]
      }
    });
  }

  async act(props) {
    const thisValue = this.get('value');
    const value = thisValue === undefined ? props.arguments : thisValue;
    return JSON.stringify(value, null, this.get('space'));
  }
}
