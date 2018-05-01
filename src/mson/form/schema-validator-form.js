import Form from './form';

export default class SchemaValidatorForm extends Form {
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

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'compiler');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'compiler');
    return value === undefined ? super.getOne(name) : value;
  }
}
