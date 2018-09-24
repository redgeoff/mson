import Action from './action';

export default class UpsertDoc extends Action {
  _className = 'UpsertDoc';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'store',
            component: 'Field'
          }
        ]
      }
    });
  }

  async act(props) {
    return this.get('store').upsertDoc({
      form: props.component
    });
  }
}
