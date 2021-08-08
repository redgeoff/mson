import Action from './action';

export default class UpsertDoc extends Action {
  className = 'UpsertDoc';

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
