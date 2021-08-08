import Action from './action';

export default class GetDoc extends Action {
  className = 'GetDoc';

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
    return this.get('store').getDoc({
      where: this.get('where'),
    });
  }
}
