import Field from './field';

export default class ExtendedField extends Field {
  _className = 'ExtendedField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'properties',
            component: 'Field',
            required: true
          }
        ]
      }
    });
  }
}
