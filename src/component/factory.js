import Component from './component';

export default class Factory extends Component {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'product',
            component: 'Field',
            required: true
          },
          {
            name: 'properties',
            component: 'Field'
          }
        ]
      }
    });
  }

  produce() {
    const component = this.get('product')();
    const properties = this.get('properties');
    if (properties) {
      component.set(properties);
    }
    return component;
  }
}
