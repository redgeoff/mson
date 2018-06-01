import ListField from './list-field';
import SelectField from './select-field';

export default class SelectListField extends ListField {
  _onFieldCreated(field, onDelete) {
    field.on('value', value => {
      // Don't delete the last field
      if (!value && !this._isLastField(field)) {
        onDelete();
      }

      // Create last field if the last field is not blank and we are allowed to add more fields
      if (!this._isLastFieldBlank() && this.canAddMoreFields(value)) {
        this._createNewField();
      }

      this._calcValue();
    });
  }

  _newField(name) {
    return new SelectField({
      name: name,
      label: name === 0 ? this.get('label') : undefined,
      required: false,
      blankString: this.get('blankString'),
      block: this.get('block') === undefined ? true : this.get('block'),
      fullWidth: this.get('fullWidth'),
      options: this.get('options')
    });
  }

  _createNewField() {
    const field = this._createField();
    field.set({ options: this.get('options') });
  }

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'options',
            // TODO: define and use a proper field
            component: 'Field'
          },
          {
            name: 'blankString',
            component: 'TextField'
          }
        ]
      }
    });

    // Create the first field
    this._createNewField();
  }

  set(props) {
    super.set(props);

    // This needs to come first as we need to set the options and blankString before creating any
    // fields
    this._setIfUndefined(props, 'options', 'blankString');

    if (props.options !== undefined) {
      // Set options for all fields
      this.eachField(field => field.set({ options: props.options }));
    }

    if (props.blankString !== undefined) {
      this.eachField(field => field.set({ blankString: props.blankString }));
    }
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'options', 'blankString');
    return value === undefined ? super.getOne(name) : value;
  }

  _shouldRemoveField(field) {
    // Don't remove the last field as the user needs it to enter the next value
    return !this._isLastField(field);
  }

  clone() {
    const clonedField = super.clone();

    // Clear the fields as the listeners now have the wrong references to the fields, etc...
    clonedField._clearFields();

    // Create the default field
    clonedField._createNewField();

    // Copy any existing value
    clonedField.setValue(this.getValue());

    return clonedField;
  }
}
