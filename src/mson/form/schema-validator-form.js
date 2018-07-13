import Form from './form';

export default class SchemaValidatorForm extends Form {
  _create(props) {
    super._create(props);

    this.set({
      props: ['compiler']
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
