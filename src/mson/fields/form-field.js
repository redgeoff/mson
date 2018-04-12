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

  // TODO: actually, probably need to just all pass through on all these props via set and get.
  // Create helper function in Component for this
  _listenToForm(form) {
    this._bubbleUpEvents(form, [
      'dirty',
      'err',
      'disabled',
      'editable',
      'touched',
      'pristine'
    ]);
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

  set(props) {
    super.set(props);

    if (props.value !== undefined) {
      this._setValue(props.value);
    }

    if (props.form !== undefined) {
      this._setForm(props.form);
    }
  }

  _getValue() {
    return this.getValues();
  }

  getOne(name) {
    if (name === 'value') {
      return this._getValue();
    }

    const value = this._getIfAllowed(name, 'form');
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
