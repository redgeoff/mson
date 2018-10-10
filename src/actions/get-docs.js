import Action from './action';

export default class GetDocs extends Action {
  _className = 'GetDocs';

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
    return this.get('store').getAllDocs({
      where: this.get('where')
    });
  }
}
