import Form from './form';
import { TextField, FormField } from './fields';
import sift from 'sift';

// TODO: Abstract ValidatorSelector into something like ObjectField so it can be used to define
// generic objects?
class ValidatorSelector extends Form {
  constructor(props) {
    super(props);

    this._selectorError = null;
  }

  _create(props) {
    super._create(Object.assign(props, { omitDefaultFields: true }));

    // The fields are dynamic so we need to disable the undefined check
    this._set('reportUndefined', false);
  }

  setValues(values) {
    super.setValues(values);

    this._selectorError = null;
    this._valueSet = values;
  }

  // Needed as
  isBlank() {
    return this._valueSet ? false : true;
  }

  validate() {
    super.validate();

    if (this._valueSet) {
      try {
        // Use sift to validate the selector
        sift(this._valueSet);
      } catch (err) {
        this._selectorError = err.message;
        this.set({ err: true });
      }
    }
  }

  getErrs() {
    let errs = super.getErrs();
    if (this._selectorError !== null) {
      errs = errs.concat({ error: this._selectorError });
    }
    return errs;
  }
}

class ValidatorError extends Form {
  _create(props) {
    super._create(props);

    this.addField(
      new TextField({
        name: 'field',
        label: 'Field',
        required: true
      })
    );

    this.addField(
      new TextField({
        name: 'error',
        label: 'error',
        required: true
      })
    );
  }
}

export default class FormValidator extends Form {
  _create(props) {
    super._create(props);

    this.addField(
      new FormField({
        name: 'selector',
        label: 'Selector',
        form: new ValidatorSelector(),
        required: true
      })
    );

    this.addField(
      new FormField({
        name: 'error',
        label: 'Error',
        form: new ValidatorError(),
        required: true
      })
    );
  }
}
