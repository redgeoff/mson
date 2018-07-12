// TODO: Should all components use set and get instead of raw attributes? This way can inherit
// setter, getter logic

import Component from '../component';
import Validator from '../component/validator';

export default class Field extends Component {
  _create(props) {
    super._create(props);

    this.set({
      props: [
        'label',
        'value',
        'err',
        'required',
        'fullWidth',
        'touched',
        'validators',
        'hidden',
        'block',
        'disabled',
        'editable',
        'dirty',
        'help',
        'in',
        'out',
        'before',
        'showArchived',
        'searchString',
        'ignoreErrs',
        'forbidSort'
      ],
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'label',
            component: 'TextField'
          },
          {
            name: 'required',
            component: 'BooleanField'
          },
          {
            name: 'fullWidth',
            component: 'BooleanField'
          },
          // TODO: validators
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
          // {
          //   name: 'dirty',
          //   component: 'BooleanField'
          // },
          {
            name: 'help',
            component: 'Field'
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

  set(props) {
    super.set(props);

    if (
      props.value !== undefined &&
      !this.get('dirty') &&
      props.value !== this.get('value')
    ) {
      this.set({ dirty: true });
    }

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

  setTouched(touched) {
    this.set({ touched });
  }

  // TODO: introduce concept of icons for display values, e.g. edit event in Google Calendar
  getDisplayValue() {
    return this.get('value');
  }

  hasErr() {
    return this.get('err') ? true : false;
  }

  _validateWithRegExp(regExp, err) {
    if (!this.isBlank()) {
      const value = this.getValue();
      if (!regExp.test(value)) {
        this.setErr(err);
      }
    }
  }
}
