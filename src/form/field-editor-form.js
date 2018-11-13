import Form from './form';
import SelectField from '../fields/select-field';
import each from 'lodash/each';

export default class FieldEditorForm extends Form {
  _className = 'FieldEditorForm';

  static componentNames = [
    'AddressField',
    'BooleanField',
    'ButtonField',
    'ChainedSelectField',
    'ChainedSelectListField',
    'CityField',
    // 'CollectionField',
    // 'CompositeField',
    'CountryField',
    'DateField',
    'EmailField',
    // 'FormField',
    'IdField',
    'IntegerField',
    // 'ListField',
    'MoneyField',
    'NumberField',
    'PasswordField',
    'PersonFullNameField',
    'PersonNameField',
    'PhoneField',
    'ProvinceField',
    'ReCAPTCHAField',
    // 'RegExpField',
    'SelectField',
    'SelectListField',
    'StateField',
    'Text',
    'TextField',
    'TextListField',
    'TimeField',
    'URLField'
  ];

  _namesToOptions() {
    return this.constructor.componentNames.map(name => ({
      value: name,
      label: name
    }));
  }

  _clearFields() {
    this.eachField(field => {
      const name = field.get('name');
      if (!this.isDefaultField(name) && name !== 'componentName') {
        this.removeField(name);
      }
    });
    this._emitChangeToFields(null);
  }

  _copySchemaFields(schema) {
    const fields = [];
    schema.eachField(field => {
      const name = field.get('name');
      if (!schema.isDefaultField(name) && field.get('docLevel') === 'basic') {
        this.addField(field);
        fields.push(field);
      }
    });
    this._emitChangeToFields(fields);
  }

  _adjustFields(values) {
    // Use the component schema to display fields to the user

    // Clear any previous fields that are not default fields or componentName
    this._clearFields();

    if (values.componentName) {
      const compiler = this._registrar.compiler;

      this._component = compiler.newComponent({
        component: values.componentName
      });

      const schema = new Form();
      this._component.buildSchemaForm(schema, compiler);
      this._copySchemaFields(schema);

      // Preserve any applicable values from the previous component
      each(values, (value, name) => {
        if (this.hasField(name)) {
          this.getField(name).setValue(value);
        }
      });
    }
  }

  _create(props) {
    super._create(props);

    this.set({
      fields: [
        new SelectField({
          name: 'componentName',
          label: 'Field',
          options: this._namesToOptions()
        })
      ]
    });

    // Adjust the fields when the componentName changes
    this.getField('componentName').on('value', () =>
      this._adjustFields(this.getValues())
    );
  }

  setValues(values) {
    // Is the componentName changing?
    if (
      !this._component ||
      (values.componentName &&
        this._component.getClassName() !== values.componentName)
    ) {
      this._adjustFields(
        Object.assign({}, this.getValues(), {
          componentName: values.componentName
        })
      );
    }

    super.setValues(values);
  }
}
