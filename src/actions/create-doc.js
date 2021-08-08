import Action from './action';

export default class CreateDoc extends Action {
  className = 'CreateDoc';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'store',
            component: 'Field',
          },
        ],
      },
    });
  }

  async act(props) {
    return this.get('store').createDoc({
      form: props.component,
    });
  }
}
