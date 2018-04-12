import Field from './field';
// import globals from '../globals';

export default class FormField extends Field {
  addForm(values) {
    const clonedForm = this.get('form').clone();
    clonedForm.setValues(values);

    const id = clonedForm.getField('id');
    let key = 0;
    if (id.isBlank()) {
      // The id value is blank so use the current _forms length as the key
      key = this._forms.length();
    } else {
      key = id.getValue();
    }

    this._forms.set(key, clonedForm);
  }

  _setValue(value) {
    this.setValues(value);
  }

  _listenToForm(form) {
    this._bubbleUpEvents(form, ['dirty', 'touched']);

    form.on('err', err => {
      this.setErr(form.getErrs());
    });
  }

  _setForm(form) {
    // Clean up an existing form
    const oldForm = this.get('form');
    if (oldForm) {
      oldForm.removeAllListeners();
    }

    // Clone the form so that we don't mutate the original
    const clonedForm = form.clone();
    this._set('form', clonedForm);
    this._listenToForm(clonedForm);
  }

  _setErr(err) {
    // We clear all the errs if err is null. We don't pass down other values as we don't want to
    // create a circular loop.
    if (err === null) {
      this._form.clearErrs();
    }
  }

  set(props) {
    super.set(props);

    if (props.form !== undefined) {
      this._setForm(props.form);
    }

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

      if (props.err === 'err') {
        this._setErr(props.err);
      }
    }
  }

  _getValue() {
    return this.getValues();
  }

  getOne(name) {
    let value = this._getFrom(this._form, name, [
      'value',
      'dirty',
      'disabled',
      'editable',
      'touched',
      'pristine'
    ]);
    if (value !== undefined) {
      return value;
    }

    value = this._getIfAllowed(name, 'form');
    return value === undefined ? super.getOne(name) : value;
  }

  // async save(form) {
  //   globals.displaySnackbar(this.get('label') + ' saved');
  // }
  //
  // async delete(form) {
  //   globals.displaySnackbar(this.get('label') + ' deleted');
  // }

  validate() {
    this.get('form').validate();
  }

  getForm() {
    return this.get('form');
  }

  getValues() {
    return this.get('form').getValues();
  }

  setValues(values) {
    this.get('form').setValues(values);
  }

  getField(name) {
    return this.get('form').getField(name);
  }
}
