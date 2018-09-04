import Form from './form';

export default class SchemaValidatorForm extends Form {
  _className = 'SchemaValidatorForm';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'compiler',
            component: 'Field',
            required: true
          }
        ]
      }
    });
  }

  setValues(values) {
    // Dynamically build this form based on the component
    const compiler = this.get('compiler');
    const field = compiler.newComponent({
      component: values.component
    });
    field.buildSchemaForm(this, compiler);

    // We assign the name to the id so that errors are more descriptive
    super.setValues(Object.assign({}, values, { id: values.name }));
  }
}
