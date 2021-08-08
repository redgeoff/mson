import Action from './action';

export default class GetDocs extends Action {
  className = 'GetDocs';

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
            name: 'where',
            component: 'WhereField',
          },
        ],
      },
    });
  }

  async act(/* props */) {
    return this.get('store').getAllDocs({
      where: this.get('where', true),
    });
  }
}
