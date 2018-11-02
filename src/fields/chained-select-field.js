// TODO:
// - Option to require that a leaf node is selected?
// - Validation should make sure hierarchy is valid

import ListField from './list-field';
import Hierarchy from '../hierarchy';
import SelectField from './select-field';

// "options": [
//   { "value": "germany", "label": "Germany" },
//   { "value": "bmw", "label": "BMW", "parentValue": "germany" },
//   { "value": "m3", "label": "m3", "parentValue": "bmw" },
//   { "value": "i3", "label": "i3", "parentValue": "bmw" }
// ]
export default class ChainedSelectField extends ListField {
  _className = 'ChainedSelectField';

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
            component: 'ChainedSelectOptionsField',
            docLevel: 'basic'
          },
          {
            name: 'blankString',
            component: 'TextField'
          },
          {
            name: 'multiline',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      autoCreateFields: true,
      startWithField: false
    });
  }

  _getValue() {
    // Go all the way down the chain until nothing selected
    let value = [];
    this.eachField(field => {
      const val = field.getValue();
      if (val) {
        value.push(val);
      } else {
        // Exit loop prematurely
        return false;
      }
    });
    return value.length > 0 ? value : null;
  }

  _newField(index) {
    return new SelectField({
      name: index,
      label: index === 0 ? this.get('label') : undefined,
      required: index === 0 ? this.get('required') : undefined,
      block: !!this.get('multiline'),
      autoHideLabel: false,
      autocomplete: false,
      ...this.get([
        'blankString',
        'fullWidth',
        'hideLabel',
        'useDisplayValue',
        'editable'
      ])
    });
  }

  _onFieldCreated(field, onDelete) {
    field.on('value', value => {
      const index = field.get('name');

      if (value) {
        // Set options for next field
        this._setFieldOptions(field.getValue(), index + 1);

        // Clear the next field
        this._clearFieldIfExists(index + 1);

        // Clear any fields after the next field
        this._clearAndHideNextFieldsIfExist(index + 2);
      } else {
        // Clear any fields after this field
        this._clearAndHideNextFieldsIfExist(index + 1);
      }

      this._calcValue();
    });
  }

  _getChildOptions(value, index) {
    // The parentValue can only be null if the index is 0 or else we will get the root options when
    // it is not intended.
    // if (value !== null || index === 0) {
    return this._indexedOptions.mapByParent(value, option => {
      return {
        value: option.id,
        label: option.label
      };
    });
    // } else {
    //   return [];
    // }
  }

  _setFieldOptions(value, index) {
    const childOptions = this._getChildOptions(value, index);

    // Are there child options? i.e. the hierarchy continues down another layer
    if (childOptions.length > 0) {
      const field = this._getOrCreateField(index);
      field.set({ options: childOptions });

      // Show field if hidden
      field.set({ hidden: false });
    }
  }

  _clearAndHideNextFieldsIfExist(index) {
    if (this._hasField(index)) {
      const field = this._getField(index);
      field.clearValue();
      field.set({ hidden: true });
      this._clearAndHideNextFieldsIfExist(index + 1);
    }
  }

  _cleanUpNextFields(index, value) {
    // Still on first field?
    if (index === null) {
      // Clear the first field as this will then adjust the subsequent fields
      this._fields.first().clearValue();
    }
  }

  _indexOptions(options) {
    this._indexedOptions = new Hierarchy();
    options.forEach(option => {
      this._indexedOptions.add({
        id: option.value,
        parentId: option.parentValue,
        label: option.label
      });
    });
  }

  _setOptions(options) {
    this._indexOptions(options);

    // Set the options for the first field
    this._setFieldOptions(null, 0);

    // Clear the 2nd field
    this._clearFieldIfExists(1);
  }

  set(props) {
    super.set(props);

    if (props.options !== undefined) {
      this._setOptions(props.options);
    }
  }

  clone() {
    const clonedField = super.clone();

    // Clear the fields as the listeners now have the wrong references to the fields, etc...
    clonedField._fields.clear();

    // Create the first field
    clonedField._setOptions(this.get('options'));

    // Copy any existing value
    clonedField.setValue(this.getValue());

    return clonedField;
  }
}
