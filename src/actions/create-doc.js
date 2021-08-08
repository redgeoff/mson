import Action from './action';

export default class CreateDoc extends Action {
  className = 'CreateDoc';

  create(props) {
    super.create(props);

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
