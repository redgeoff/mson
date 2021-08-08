import Component from './component';

export default class Factory extends Component {
  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'product',
            component: 'Field',
            required: true,
          },
          {
            name: 'properties',
            component: 'Field',
          },
        ],
      },
    });
  }

  produce(props) {
    const component = this.get('product')();
    const properties = this.get('properties');
    if (properties) {
      component.set(properties);
    }
    if (props) {
      component.set(props);
    }
    return component;
  }
}
