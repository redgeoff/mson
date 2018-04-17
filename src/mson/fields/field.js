// TODO: Should all components use set and get instead of raw attributes? This way can inherit
// setter, getter logic

import Component from '../component';
import Validator from '../validator';

export default class Field extends Component {
  _create(props) {
    super._create(props);
    this.set({ editable: true, block: true, out: true });

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'label',
            component: 'TextField'
          },
          {
            name: 'required',
            // TODO: create a BooleanField and use
            // component: 'BooleanField'
            component: 'TextField'
          },
          {
            name: 'fullWidth',
            component: 'TextField'
            // component: 'BooleanField'
          },
          // TODO: validators
          {
            name: 'hidden',
            component: 'TextField'
            // component: 'BooleanField'
          },
          {
            name: 'block',
            component: 'TextField'
            // component: 'BooleanField'
          },
          {
            name: 'disabled',
            component: 'TextField'
            // component: 'BooleanField'
          },
          {
            name: 'editable',
            component: 'TextField'
            // component: 'BooleanField'
          },
          {
            name: 'dirty',
            component: 'TextField'
            // component: 'BooleanField'
          },
          {
            name: 'help',
            component: 'TextField'
          },
          {
            name: 'out',
            component: 'TextField'
            // component: 'BooleanField'
          }
        ]
      }
    });
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

    // Use err instead of error as event of 'error' can cause issues
    this._setIfUndefined(
      props,
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
      'out'
    );
  }

  getOne(name) {
    // Use err instead of error as event of 'error' can cause issues
    const value = this._getIfAllowed(
      name,
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
      'out'
    );
    return value === undefined ? super.getOne(name) : value;
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
    this.set({ value: value });
  }

  clearValue() {
    this.setValue(null);
  }

  getValue() {
    return this.get('value');
  }

  isValueBlank(value) {
    // value can be '' for select when blankString selected. TODO: better here or in SelectField?
    return value === null || value === '';
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
    if (this._required && this.isBlank()) {
      this.setErr('required');
    } else if (this._validators && this._validators.length > 0) {
      const validator = new Validator(this._toValidatorProps());
      const errors = validator.validate(this._validators);
      if (errors.length !== 0) {
        this.setErr(errors[0]);
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
