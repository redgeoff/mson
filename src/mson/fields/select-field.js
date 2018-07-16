import MultipleValueField from './multiple-value-field';
import _ from 'lodash';

export default class SelectField extends MultipleValueField {
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
          },
          {
            name: 'ensureInList',
            component: 'BooleanField'
          },
          {
            name: 'multiple',
            component: 'BooleanField'
          },
          {
            name: 'removeIfNotInList',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      ensureInList: true,
      multiple: false,
      removeIfNotInList: true
    });
  }

  _setProperty(name, value) {
    super._setProperty(name, value);

    // Automatically set allowScalar
    if (name === 'multiple') {
      this.set({ allowScalar: !value });
    }
  }

  getOne(name) {
    // We consider the blank string to be a null value. We have to use isValueBlank() to prevent
    // infinite recursion.
    if (name === 'value' && this.isValueBlank(this._value)) {
      return null;
    }

    return super.getOne(name);
  }

  getOptionLabel(value) {
    let label = null;

    if (this._options) {
      this._options.forEach(option => {
        if (option.value === value) {
          label = option.label;
        }
      });
    }

    return label;
  }

  validate() {
    super.validate();

    if (!this.isBlank() && this.get('ensureInList')) {
      const value = this.get('value');
      const values = this.get('multiple') ? value : [value];
      const errors = [];
      values.forEach(val => {
        if (this.getOptionLabel(val) === null) {
          errors.push({
            error: `${val} is not an option`
          });
        }
      });

      if (errors.length > 0) {
        this.setErr(errors);
      }
    }
  }

  _setValue(value) {
    if (this.get('removeIfNotInList') && value) {
      // Clone so that we don't modify original data
      value = _.cloneDeep(value);

      const values = this.get('multiple') ? value : [value];

      const newValues = [];

      values.forEach((val, i) => {
        if (this.getOptionLabel(val) !== null) {
          // In the list
          newValues.push(val);
        }
      });

      super._setValue(this.get('multiple') ? newValues : newValues[0]);
    } else {
      super._setValue(value);
    }
  }

  getDisplayValue() {
    const value = this.get('value');
    if (this.isBlank()) {
      return value;
    } else if (this.get('multiple')) {
      return value.map(val => {
        return this.getOptionLabel(val);
      });
    } else {
      return this.getOptionLabel(value);
    }
  }
}
