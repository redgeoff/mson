import Action from './action';

export default class GenerateComponent extends Action {
  _className = 'GenerateComponent';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          // Note: we are no longer using a componentFactory, as we now opt to generate the
          // component from a string. This in turn, allows us to make any aspect of the component
          // dynamic, including the component type.
          //
          // In the future, we may want to bring back the componentFactory functionality, but for
          // now, we are opting to keep things simple and provide a single way to generate
          // components--one that works for all use cases.
          //
          // {
          //   name: 'componentFactory', component: 'Field', required: true,
          // },

          {
            // Use a string instead of object so that we can dynamically change any detail
            name: 'definition',
            component: 'TextField',
            required: true,
          },
        ],
      },
    });
  }

  async act(/* props */) {
    // const factory = this.get('componentFactory');
    // return factory.produce();

    const definition = this.get('definition');
    return this._registrar.compiler.newComponent(JSON.parse(definition));
  }
}
