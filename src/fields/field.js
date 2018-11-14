// TODO: Should all components use set and get instead of raw attributes? This way can inherit
// setter, getter logic

import Component from '../component';
import Validator from '../component/validator';

export default class Field extends Component {
  _className = 'Field';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            // The name is required as it is needed by the form
            name: 'name',
            required: true
          },
          {
            name: 'label',
            component: 'TextField',
            label: 'Label',
            docLevel: 'basic'
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
            component: 'BooleanField',
            label: 'Required',
            docLevel: 'basic'
          },
          {
            name: 'fullWidth',
            component: 'BooleanField',
            label: 'Full Width',
            docLevel: 'basic'
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
            component: 'BooleanField',
            label: 'Hidden',
            docLevel: 'basic'
          },
          {
            name: 'block',
            component: 'BooleanField',
            label: 'Block',
            docLevel: 'basic'
          },
          {
            name: 'disabled',
            component: 'BooleanField',
            label: 'Disabled',
            docLevel: 'basic'
          },
          {
            name: 'editable',
            component: 'BooleanField',
            label: 'Editable'
            // docLevel: 'basic'
          },
          {
            name: 'dirty',
            component: 'BooleanField'
          },
          {
            name: 'help',
            component: 'TextField',
            label: 'Help'
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
            name: 'after',
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
          },
          {
            name: 'hideLabel',
            component: 'BooleanField'
          },
          {
            name: 'useDisplayValue',
            component: 'BooleanField',
            label: 'Use Display Value',
            docLevel: 'basic'
          },
          {
            name: 'autoHideLabel',
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
      disabled: false,
      autoHideLabel: true
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

  setFullWidth(fullWidth) {
    this._set('fullWidth', fullWidth);
  }

  setUseDisplayValue(useDisplayValue) {
    this._set('useDisplayValue', useDisplayValue);
  }

  setHideLabel(hideLabel) {
    this._set('hideLabel', hideLabel);
  }

  set(props) {
    if (props.value !== undefined && props.value !== this.get('value')) {
      this.set({ dirty: true });
    }

    super.set(
      Object.assign({}, props, {
        value: undefined,
        required: undefined,
        disabled: undefined,
        editable: undefined,
        dirty: undefined,
        touched: undefined,
        fullWidth: undefined,
        useDisplayValue: undefined,
        hideLabel: undefined
      })
    );

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

    if (props.fullWidth !== undefined) {
      this.setFullWidth(props.fullWidth);
    }

    if (props.useDisplayValue !== undefined) {
      this.setUseDisplayValue(props.useDisplayValue);
    }

    if (props.hideLabel !== undefined) {
      this.setHideLabel(props.hideLabel);
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
    return this.constructor.isValueBlank(value);
  }

  isBlank() {
    const value = this.getValue();
    return this.isValueBlank(value);
  }

  _toValidatorProps() {
    return this;
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

  // Method used to determine if this component is a field, even if it is wrapped
  isField() {
    return true;
  }
}

Field.isValueBlank = value => {
  return value === null || value === undefined;
};
