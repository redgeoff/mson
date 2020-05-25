import Action from './action';

export default class GenerateComponent extends Action {
  _className = 'GenerateComponent';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'componentFactory',
            component: 'Field',
            required: true,
          },
        ],
      },
    });
  }

  async act(props) {
    const factory = this.get('componentFactory');
    return factory.produce();
  }
}
