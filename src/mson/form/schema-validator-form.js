import Form from './form';

export default class SchemaValidatorForm extends Form {
  setValues(values) {
    // Dynamically build this form based on the component
    const builder = this.get('builder');
    const field = builder.newComponent({
      component: values.component
    });
    field.buildSchemaForm(this, builder);

    // We assign the name to the id so that errors are more descriptive
    super.setValues(Object.assign({}, values, { id: values.name }));
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'builder');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'builder');
    return value === undefined ? super.getOne(name) : value;
  }
}
