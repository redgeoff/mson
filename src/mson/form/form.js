// TODO:
//   - Refactor out setValues(), clearValues(), etc... and use set({ value: value }), etc...?

import Component from '../component';
import _ from 'lodash';
import Validator from '../component/validator';
import Mapa from '../mapa';
import IdField from '../fields/id-field';
import ButtonField from '../fields/button-field';

export default class Form extends Component {
  _formSetMSONSchema() {
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'name',
            component: 'TextField',
            required: true
          },
          {
            name: 'fields',
            component: 'FormsField',
            // required: true,
            form: {
              component: 'SchemaValidatorForm'
            }
          },
          {
            name: 'validators',
            component: 'FormsField',
            form: {
              component: 'ValidatorForm'
            }
          },
          {
            name: 'access',
            component: 'FormField',
            form: {
              component: 'AccessForm'
            }
          },
          {
            name: 'indexes',
            component: 'Field'
            // component: 'FormsField',
            // form: {
            //   // TODO: create and use IndexForm. Needs to verfiy that fields are present--see
            //   // SchemaValidatorForm for something similar.
            //   component: 'IndexForm'
            // }
          }
        ]
      }
    });
  }

  _create(props) {
    super._create(props);
    this._fields = new Mapa();
    this._defaultFields = new Mapa();
    this._validators = [];
    this._clearExtraErrors();

    if (!props || !props.omitDefaultFields) {
      this._addDefaultFields();
      this._createDefaultFields();
    }

    // We default this to false as otherwise there is a lot of extra overhead incurred whenever we
    // set a value-especially when setting values at the top-most component.
    this._set('autoValidate', false);

    // Whether or not to report errors when an undefined (extra) field is specified
    this._set('reportUndefined', true);

    // If true, the form is reset on load
    this._set('resetOnLoad', true);

    this._formSetMSONSchema();

    this._listenForLoad();
    this._listenForUnload();
    this._listenForShowArchived();
    this._listenForSearchString();
    this._listenForScroll();
  }

  _setSubmitDisabled(disabled) {
    const button = this._getSubmitButton();
    if (button) {
      button.set({ disabled });
    }
  }

  _listenForLoad() {
    this.on('load', () => {
      if (this.get('resetOnLoad')) {
        // Clear any previous values
        this.reset();
      }

      // Note: this is probably more trouble than its worth as when the user is first filling in the
      // form there are no errors until a field is touched and in turn it is probably best to
      // provide the user with something to click that will give them feedback about the error.
      //
      // // Disable submit buttons by default
      // this._setSubmitDisabled(true);

      // Pass load event down to fields
      this._fields.each(field => field.emitLoad());
    });
  }

  _listenForUnload() {
    this.on('unload', () => {
      // Pass unload event down to fields
      this._fields.each(field => field.emitUnload());
    });
  }

  _listenForShowArchived() {
    this.on('showArchived', showArchived => {
      // Pass event down to fields
      this._fields.each(field => field.set({ showArchived }));
    });
  }

  _listenForSearchString() {
    this.on('searchString', searchString => {
      // Pass event down to fields
      this._fields.each(field => field.set({ searchString }));
    });
  }

  _listenForScroll() {
    this.on('scroll', e => {
      // Pass scroll event down to fields
      //
      // TODO: why isn't the following working?
      // this._fields.each(field => field.emit('scroll', e));
      this._fields.each(field => {
        field.emit('scroll', e);
      });
    });
  }

  isDefaultField(fieldName) {
    return this._defaultFields.has(fieldName);
  }

  _addDefaultFields() {
    this._defaultFields.set(
      'id',
      new IdField({ name: 'id', label: 'Id', hidden: true })
    );
    // TODO: createdAt, updatedAt
  }

  _createDefaultFields() {
    this._defaultFields.each(field => this.addField(field));
  }

  copyFields(form) {
    form._fields.each(field => {
      this.addField(field);
    });
    this._emitChange('fields');
  }

  copyValidators(form) {
    this.set({ validators: form.get('validators') });
  }

  copyListeners(form) {
    if (form.get('listeners')) {
      this.set({ listeners: form.get('listeners') });
    }
  }

  _clearExtraErrors() {
    this._extraErrors = [];
  }

  set(props) {
    super.set(props);

    if (props.fields !== undefined) {
      props.fields.forEach(field => {
        this.addField(field);
      });
      this._emitChange('fields');
    }

    if (props.form !== undefined) {
      this.copyFields(props.form);
      this.copyValidators(props.form);
      this.copyListeners(props.form);
    }

    if (props.validators !== undefined) {
      this._validators = [];
      props.validators.forEach(validator => {
        this.addValidator(validator);
      });
    }

    if (props.value !== undefined) {
      this.setValues(props.value);
    }

    if (props.editable !== undefined) {
      this.setEditable(props.editable);
    }

    if (props.hidden !== undefined) {
      this.setHidden(props.hidden);
    }

    if (props.snapshot !== undefined) {
      this.setSnapshot(props.snapshot);
    }

    if (props.clear === true) {
      this.clearValues();
    }

    if (props.reset === true) {
      this.reset();
    }

    // The pristine prop allows us to set the dirty prop for the form and all its fields. We keep
    // this separate from the dirty prop so that we can listen for dirty events on the fields and
    // change the dirty state without triggering an infinite loop.
    if (props.pristine !== undefined) {
      this.setDirty(!props.pristine);
    }

    if (props.err !== undefined) {
      this._emitCanOrCannotSubmit();
    }

    this._setIfUndefined(
      props,
      'touched',
      'err',
      'dirty',
      'pristine',
      'access',
      'autoValidate',
      'reportUndefined',
      'resetOnLoad',
      'archivedAt',
      'userId',
      'showArchived',
      'searchString',
      'cursor',
      'snapshot'
    );
  }

  _setField(field) {
    // Make sure the before field is present
    const before = field.get('before');
    const beforeName = before && this.hasField(before) ? before : undefined;

    this._fields.set(field.get('name'), field, beforeName);
  }

  addField(field) {
    this._setField(field);

    // TODO: need to consider that field already exists. Also need to worry about cleaning up any
    // existing listeners when this happens?

    field.on('value', () => {
      // We don't emit a value as we don't want to calculate the form value each time a field value
      // changes. Instead, you can simply call form.getValues();
      this._emitChange('values');
      if (this.get('autoValidate')) {
        this.validate();
      }
    });

    field.on('touched', touched => {
      if (touched) {
        this.set({ touched: true });
      }
      if (this.get('autoValidate')) {
        this.validate();
      }
    });

    field.on('err', err => {
      if (err) {
        this.set({ err: true });
      }
    });

    field.on('dirty', dirty => {
      if (dirty) {
        this.set({ dirty: true });
      }
    });

    field.on('click', () => {
      this._emitChange(field.get('name'));
    });
  }

  removeField(name) {
    const field = this.getField(name);

    this._fields.delete(name);

    // Prevent a listener leak
    field.removeAllListeners();
  }

  removeFieldsExcept(names) {
    this._fields.each((field, name) => {
      if (names === undefined || names.indexOf(name) === -1) {
        this.removeField(name);
      }
    });
  }

  removeBlankFields() {
    this._fields.each((field, name) => {
      if (field.isBlank()) {
        this.removeField(name);
      }
    });
  }

  getOne(name) {
    if (name === 'value') {
      return this.getValues();
    }

    const value = this._getIfAllowed(
      name,
      'fields',
      'validators',
      'touched',
      'err',
      'dirty',
      'pristine',
      'access',
      'autoValidate',
      'reportUndefined',
      'resetOnLoad',
      'archivedAt',
      'userId',
      'showArchived',
      'searchString',
      'cursor',
      'snapshot'
    );
    return value === undefined ? super.getOne(name) : value;
  }

  getField(name) {
    const field = this._fields.get(name);
    if (!field) {
      throw new Error('missing field ' + name);
    } else {
      return field;
    }
  }

  hasField(name) {
    return this._fields.has(name);
  }

  getValues(props) {
    let values = {};
    props = props ? props : {};
    this._fields.each(field => {
      const name = field.get('name');
      if (
        (props.in === undefined || props.in === !!field.get('in')) &&
        (props.out === undefined || props.out === !!field.get('out')) &&
        (props.blank === undefined || props.blank === !!field.isBlank()) &&
        (props.default === undefined ||
          props.default === !!this.isDefaultField(name))
      ) {
        values[name] = field.get('value');
      }
    });
    return values;
  }

  _validateValuesType(values) {
    let hasError = false;

    if (
      values === null ||
      (typeof values === 'object' && !Array.isArray(values))
    ) {
      // No error
    } else {
      hasError = true;
    }

    this._hasTypeError = hasError;
  }

  setValues(values) {
    this._validateValuesType(values);
    this._clearExtraErrors();
    if (!this._hasTypeError) {
      _.each(values, (value, name) => {
        if (this.hasField(name)) {
          this.getField(name).setValue(value);
        } else if (this.get('reportUndefined')) {
          this._extraErrors.push({
            field: name,
            error: 'undefined field'
          });
        }
      });
    }
  }

  clearValues() {
    this._fields.each(field => field.clearValue());
  }

  clearErrs() {
    this.set({ err: null });
    this._fields.each(field => field.clearErr());
  }

  reset() {
    this.clearValues();
    this.clearErrs();
    this.set({ pristine: true });
    this.setTouched(false);
  }

  _toValidatorProps() {
    // TODO: should calc of these props be a little more dynamic? e.g. could make them a function so
    // that only calculated when matched by validators
    let props = {};
    this._fields.each(field => {
      props[field.get('name')] = field._toValidatorProps();
    });
    return props;
  }

  _validateWithValidators() {
    if (this._validators && this._validators.length > 0) {
      const validator = new Validator(this._toValidatorProps());
      const errors = validator.validate(this._validators);
      if (errors.length !== 0) {
        errors.forEach(error => {
          this.getField(error.field).setErr(error.error);
        });
      }
    }
  }

  canSubmit() {
    // return !this.hasErrorForTouchedField() && this.get('dirty');
    return !this.hasErrorForField() && this.get('dirty');
  }

  _emitCanOrCannotSubmit() {
    // Emit a canSubmit or cannotSubmit event so that we can adjust buttons, etc...
    const canSubmit = this.canSubmit();
    if (canSubmit) {
      this._setSubmitDisabled(false);
    }
    // this._setSubmitDisabled(!canSubmit);
    this._emitChange(canSubmit ? 'canSubmit' : 'cannotSubmit');
  }

  validate() {
    this.clearErrs();

    this._fields.each(field => field.validate());

    // TODO: should we also support functional validators? Probably as more powerful when working
    // just with JS. Other option is to extend form and define new validate().
    // this._validators.forEach(validator => validator(this));
    this._validateWithValidators();

    if (this._hasTypeError || this._extraErrors.length > 0) {
      this.set({ err: true });
    }

    this._emitCanOrCannotSubmit();
  }

  addValidator(validator) {
    this._validators.push(validator);
  }

  setTouched(touched) {
    this.set({ touched });
    this._fields.each(field => field.setTouched(touched));
  }

  setRequired(required) {
    this._fields.each(field => field.set({ required }));
  }

  setDisabled(disabled) {
    this._fields.each(field => field.set({ disabled }));
  }

  setEditable(editable) {
    this._fields.each(field => field.set({ editable }));
  }

  setHidden(hidden) {
    this._fields.each(field => field.set({ hidden }));
  }

  setSnapshot(snapshot) {
    if (snapshot === 'restore') {
      if (this._snapshotFields) {
        this._snapshotFields.forEach(field => {
          this.getField(field.name).set(field);
        });
      }
    } else {
      // Take
      const fields = this.mapFields(field =>
        field.get(['name', 'hidden', 'required', 'out', 'in'])
      );
      this._snapshotFields = fields;
    }
  }

  // TODO: remove and use set({ pristine }) instead?
  setDirty(dirty) {
    this.set({ dirty });
    this._fields.each(field => field.set({ dirty }));
  }

  setFullWidth(fullWidth) {
    this._fields.each(field => field.set({ fullWidth }));
  }

  clone() {
    const clonedForm = _.cloneDeep(this);

    // Remove the fields as we need to re-add them below
    clonedForm._fields.clear();

    // We need to use addField() and not _setField() as we need the listeners to be recreated
    this._fields.each(field => clonedForm.addField(field.clone()));

    return clonedForm;
  }

  hasSetErrors() {
    return this._hasTypeError || this._extraErrors.length > 0;
  }

  getErrs() {
    let errs = [];

    if (this._hasTypeError) {
      errs.push({ error: 'must be an object' });
    } else {
      if (this._extraErrors.length > 0) {
        errs = errs.concat(this._extraErrors);
      }

      // Only if there we haven't encountered errors during the last set do we want to calculate the
      // field errors as these set errors can often cause field errors and we want to focus on the
      // root cause.
      this._fields.each(field => {
        const err = field.getErr();
        if (err) {
          errs.push({
            field: field.get('name'),
            error: err
          });
        }
      });
    }

    return errs;
  }

  hasErr() {
    return this.get('err') ? true : false;
  }

  // TODO: make this more efficient by using a prop that is set by the field listeners. This way the
  // value is cached.
  hasErrorForTouchedField() {
    let hasErr = false;
    this._fields.each(field => {
      if (field.get('touched') && field.getErr()) {
        hasErr = true;
        return false; // exit loop
      }
    });
    return hasErr;
  }

  // TODO: make this more efficient by using a prop that is set by the field listeners. This way the
  // value is cached.
  hasErrorForField() {
    let hasErr = false;
    this._fields.each(field => {
      if (field.getErr()) {
        hasErr = true;
        return false; // exit loop
      }
    });
    return hasErr;
  }

  _getSubmitButton() {
    let button = null;
    this.eachField(field => {
      if (field instanceof ButtonField && field.get('type') === 'submit') {
        button = field;
        return false; // exit loop
      }
    });
    return button;
  }

  submit() {
    const button = this._getSubmitButton();
    if (button) {
      button.emitClick();
    }
  }

  *getFields() {
    yield* this._fields.values();
  }

  isBlank() {
    let isBlank = true;
    this._fields.each(field => {
      if (!field.isBlank()) {
        isBlank = false;
        return false; // exit loop
      }
    });
    return isBlank;
  }

  eachField(onField) {
    this._fields.each((field, name, last) => onField(field, name, last));
  }

  mapFields(onField) {
    return this._fields.map((field, name, last) => onField(field, name, last));
  }

  buildSchemaForm(form, compiler) {
    super.buildSchemaForm(form, compiler);

    form
      .getField('fields')
      .get('form')
      .set({ compiler });

    // Monkey patch setValues so that we can dynamically set the fieldNames when validating the
    // access
    const origSetValues = form.setValues;
    form.setValues = function(values) {
      let fieldNames = [];
      if (values.fields) {
        values.fields.forEach(field => {
          // Was a name specified? It may not have been if there is an error in the fields def
          if (field.name) {
            fieldNames.push(field.name);
          }
        });
      }
      form
        .getField('access')
        .getForm()
        .set({ fieldNames });

      origSetValues.apply(this, arguments);
    };
  }

  getValue(fieldName) {
    return this.getField(fieldName).getValue();
  }
}
