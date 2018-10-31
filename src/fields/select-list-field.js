import ListField from './list-field';
import SelectField from './select-field';

export default class SelectListField extends ListField {
  _className = 'SelectListField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'fieldFactory',
            required: false
          },
          {
            name: 'options',
            component: 'OptionsField',
            docLevel: 'basic'
          },
          {
            name: 'blankString',
            component: 'TextField'
          },
          {
            name: 'ensureInList',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      autoCreateFields: true,
      canDeleteEmpty: false,
      startWithField: true,
      hideDeleteButton: true
    });
  }

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
      name,
      hideLabel: true,
      required: false,
      ...this.get([
        'blankString',
        'block',
        'fullWidth',
        'options',
        'useDisplayValue',
        'editable'
      ])
    });
  }

  _createNewField() {
    const field = this.createField();
    field.set({ options: this.get('options') });
  }

  set(props) {
    super.set(props);
    this._setForAllFields(props, ['options', 'blankString', 'ensureInList']);
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
