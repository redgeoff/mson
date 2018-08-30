import Field from './field';

export default class FormField extends Field {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'form',
            component: 'Field',
            required: true
          }
        ]
      }
    });
  }

  _listenToForm(form) {
    this._bubbleUpEvents(form, ['dirty', 'touched']);
  }

  _setForm(form) {
    // Clean up any existing form
    const oldForm = this.get('form');
    if (oldForm) {
      oldForm.removeAllListeners();
    }

    // Clone the form so that we don't mutate the original
    const clonedForm = form.clone();
    this._set('form', clonedForm);
    this._listenToForm(clonedForm);
  }

  set(props) {
    if (props.form !== undefined) {
      this._setForm(props.form);

      // Clear the form prop so that super.set() does not try to set it again
      props = Object.assign({}, props, { form: undefined });
    }

    super.set(props);

    // Was the form set? It may not have been set yet
    if (this._form) {
      // Set properties on form
      this._setOn(this._form, props, [
        'value',
        'dirty',
        'disabled',
        'editable',
        'touched',
        'pristine'
      ]);
    }
  }

  getOne(name) {
    let value = this._getFrom(this._form, name, [
      'dirty',
      'disabled',
      'editable',
      'touched',
      'pristine'
    ]);
    if (value !== undefined) {
      return value;
    }

    if (name === 'value') {
      return this.getValues();
    }

    return super.getOne(name);
  }

  validate() {
    const form = this.get('form');
    form.validate();
    if (form.hasSetErrors()) {
      // If the form has errors from the last set, e.g. "not an object," then we want only these
      // errors as they are often the root of sub-errors.
      this.setErr(form.getErrs());
    } else {
      super.validate();
      if (!this.hasErr() && form.hasErr()) {
        this.setErr(form.getErrs());
      }
    }
  }

  getForm() {
    return this.get('form');
  }

  getValues() {
    return this.get('form').get('value');
  }

  setValues(values) {
    this.get('form').setValues(values);
  }

  getField(name) {
    return this.get('form').getField(name);
  }

  isBlank() {
    return this.get('form').isBlank();
  }
}
