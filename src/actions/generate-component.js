import Action from './action';
import compiler from '../compiler';

export default class GenerateComponent extends Action {
  _className = 'GenerateComponent';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          // {
          //   name: 'componentFactory',
          //   component: 'Field',
          //   required: true,
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
    return compiler.newComponent(JSON.parse(definition));
  }
}
