import Action from './action';

export default class GetDoc extends Action {
  _className = 'GetDoc';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'store',
            component: 'Field'
          },
          {
            name: 'where',
            component: 'WhereField'
          }
        ]
      }
    });
  }

  async act(/* props */) {
    return this.get('store').getDoc({
      where: this.get('where')
    });
  }
}
