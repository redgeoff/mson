import Field from './field';

export default class FormField extends Field {
  _className = 'FormField';

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
          },
          {
            name: 'pristine',
            component: 'BooleanField'
          },
          {
            name: 'elevate',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._listenForLoad();
  }

  _listenToForm(form) {
    this._bubbleUpEvents(form, ['dirty', 'touched']);

    // We use _set() instead of set() so that a change from the form isn't passed back down to the
    // form
    form.on('value', () => this._set('value', this.getValues()));
  }

  _handleLoadFactory() {
    return () => {
      // Pass load event down to form
      this.get('form').emitLoad();
    };
  }

  _listenForLoad() {
    this.on('load', this._handleLoadFactory());
  }

  _setForm(form) {
    // Clean up any existing form
    const oldForm = this.get('form');
    if (oldForm) {
      oldForm.removeAllListeners();
    }

    // Note: we will be modifying the form. A previous design cloned the form, but the clone method
    // leads to race conditions such as where the the didCreate event is never fired on a sub field
    // of the cloned field.
    this._set('form', form);
    this._listenToForm(form);
  }

  set(props) {
    const clonedProps = Object.assign({}, props, {
      form: undefined
    });

    super.set(clonedProps);

    if (props.form !== undefined) {
      this._setForm(props.form);
    }

    if (props.err === null) {
      this._setOnForm({ err: null });
    }

    // Was the form set? It may not have been set yet
    if (this._form) {
      // Set properties on form
      this._setOn(this._form, clonedProps, [
        'value',
        'dirty',
        'disabled',
        'editable',
        'touched',
        'pristine',
        'useDisplayValue',
        'fullWidth'
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

  _setOnForm(props) {
    this.get('form').set(props);
  }
}
