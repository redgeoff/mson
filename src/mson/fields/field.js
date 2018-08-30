// TODO: Should all components use set and get instead of raw attributes? This way can inherit
// setter, getter logic

import Component from '../component';
import Validator from '../component/validator';

export default class Field extends Component {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'label',
            component: 'TextField'
          },
          {
            name: 'value',
            component: 'Field'
          },
          {
            name: 'err',
            component: 'Field'
          },
          {
            name: 'required',
            component: 'BooleanField'
          },
          {
            name: 'fullWidth',
            component: 'BooleanField'
          },
          {
            name: 'touched',
            component: 'BooleanField'
          },
          {
            name: 'validators',
            component: 'Field'
          },
          {
            name: 'hidden',
            component: 'BooleanField'
          },
          {
            name: 'block',
            component: 'BooleanField'
          },
          {
            name: 'disabled',
            component: 'BooleanField'
          },
          {
            name: 'editable',
            component: 'BooleanField'
          },
          {
            name: 'dirty',
            component: 'BooleanField'
          },
          {
            name: 'help',
            component: 'TextField'
          },
          {
            name: 'in',
            component: 'BooleanField'
          },
          {
            name: 'out',
            component: 'BooleanField'
          },
          {
            name: 'before',
            component: 'TextField'
          },
          {
            name: 'showArchived',
            component: 'BooleanField'
          },
          {
            name: 'searchString',
            component: 'TextField'
          },
          {
            name: 'ignoreErrs',
            component: 'BooleanField'
          },
          {
            name: 'forbidSort',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      editable: true,
      block: true,
      out: true,
      in: true,
      hidden: false,
      required: false,
      fullWidth: false,
      disabled: false
    });
  }

  _setValue(value) {
    this._set('value', value);
  }

  _setRequired(required) {
    this._set('required', required);
  }

  _setDisabled(disabled) {
    this._set('disabled', disabled);
  }

  _setEditable(editable) {
    this._set('editable', editable);
  }

  _setDirty(dirty) {
    this._set('dirty', dirty);
  }

  setTouched(touched) {
    this._set('touched', touched);
  }

  set(props) {
    if (props.value !== undefined && props.value !== this.get('value')) {
      this.set({ dirty: true });
    }

    super.set(props);

    if (props.value !== undefined) {
      this._setValue(props.value);
    }

    if (props.required !== undefined) {
      this._setRequired(props.required);
    }

    if (props.disabled !== undefined) {
      this._setDisabled(props.disabled);
    }

    if (props.editable !== undefined) {
      this._setEditable(props.editable);
    }

    if (props.dirty !== undefined) {
      this._setDirty(props.dirty);
    }

    if (props.touched !== undefined) {
      this.setTouched(props.touched);
    }
  }

  setErr(err) {
    this.set({ err });
  }

  clearErr() {
    this.setErr(null);
  }

  getErr() {
    return this.get('err');
  }

  setValue(value) {
    this.set({ value });
  }

  clearValue() {
    this.setValue(null);
  }

  getValue() {
    return this.get('value');
  }

  isValueBlank(value) {
    // value can be '' for select when blankString selected. TODO: better here or in SelectField?
    return value === null || value === '' || value === undefined;
  }

  isBlank() {
    const value = this.getValue();
    return this.isValueBlank(value);
  }

  _toValidatorProps() {
    // TODO: should calc of these props be a little more dynamic? e.g. could make them a function so
    // that only calculated when matched by validators
    return {
      ...this.get(),
      value: this.get('value')
    };
  }

  // TODO: also support _validators being function like at form layer?
  validate() {
    if (!this.get('ignoreErrs')) {
      if (this._required && this.isBlank()) {
        this.setErr('required');
      } else if (
        !this.isBlank() &&
        this._validators &&
        this._validators.length > 0
      ) {
        const validator = new Validator(this._toValidatorProps());
        const errors = validator.validate(this._validators);
        if (errors.length !== 0) {
          this.setErr(errors[0]);
        }
      }
    }
  }

  // TODO: introduce concept of icons for display values, e.g. edit event in Google Calendar
  getDisplayValue() {
    return this.get('value');
  }

  hasErr() {
    return !!this.get('err');
  }

  _validateWithRegExp(regExp, err) {
    if (!this.isBlank()) {
      const value = this.getValue();
      if (!regExp.test(value)) {
        this.setErr(err);
      }
    }
  }

  getFirstErr() {
    const err = this.get('err');
    if (Array.isArray(err)) {
      if (Array.isArray(err[0].error)) {
        return err[0].error[0].error;
      } else {
        return err[0].error;
      }
    } else {
      return err;
    }
  }
}
