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
            name: 'space',
            component: 'IntegerField'
          }
        ]
      }
    });
  }

  async act(props) {
    const value = props.arguments;
    return JSON.stringify(value, null, this.get('space'));
  }
}
