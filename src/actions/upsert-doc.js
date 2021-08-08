import Action from './action';

export default class UpsertDoc extends Action {
  className = 'UpsertDoc';

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
          {
            name: 'form',
            component: 'Field',
          },
        ],
      },
    });
  }

  async act(props) {
    const form = this.get('form');
    return this.get('store').upsertDoc({
      form: form ? form : props.component,
    });
  }
}
