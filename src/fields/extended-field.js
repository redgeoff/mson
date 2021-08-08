import Field from './field';

export default class ExtendedField extends Field {
  className = 'ExtendedField';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'properties',
            component: 'Field',
            required: true,
          },
        ],
      },
    });
  }
}
