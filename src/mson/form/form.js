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
          }
        ]
      }
    });
  }

  _create(props) {
    super._create(props);
    this._fields = new Mapa();
    this._validators = [];
    this._clearExtraErrors();

    if (!props || !props.omitDefaultFields) {
      this._createDefaultFields();
    }

    // We default this to false as otherwise there is a lot of extra overhead incurred whenever we
    // set a value-especially when setting values at the top-most component.
    this._set('autoValidate', false);

    // Whether or not to report errors when an undefined (extra) field is specified
    this._set('reportUndefined', true);

    this._formSetMSONSchema();
  }

  _createDefaultFields() {
    this.addField(new IdField({ name: 'id', label: 'Id', hidden: true }));
    // TODO: createdAt, updatedAt
  }

  copyFields(form) {
    form._fields.each(field => {
      this.addField(field);
    });
    this._emitChange('fields');
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

    this._setIfUndefined(
      props,
      'touched',
      'err',
      'dirty',
      'pristine',
      'access',
      'autoValidate',
      'reportUndefined'
    );
  }

  _setField(field) {
    this._fields.set(field.get('name'), field);
  }

  // TODO: support field.beforeName
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
      'reportUndefined'
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

  getValues() {
    let values = {};
    this._fields.each(field => {
      if (field.get('out')) {
        values[field.get('name')] = field.get('value');
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
    return !this.hasErrorForTouchedField() && this.get('dirty');
  }

  validate() {
    this.clearErrs();

    this._fields.each(field => field.validate());

    // TODO: should we also support functional validators? Probably as more powerful when working
    // just with JS. Other option is to extend form and define new validate().
    // this._validators.forEach(validator => validator(this));
    this._validateWithValidators();

    // Emit a canSubmit or cannotSubmit event so that we can adjust buttons, etc...
    this._emitChange(this.canSubmit() ? 'canSubmit' : 'cannotSubmit');

    if (this._hasTypeError || this._extraErrors.length > 0) {
      this.set({ err: true });
    }
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

    // We need to use addField() and not _setField() as we need the listeners to be recreated
    clonedForm._fields.each(field => clonedForm.addField(field.clone()));

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

  submit() {
    // Simulate a click on the first ButtonField of type=submit
    this._fields.each(field => {
      if (field instanceof ButtonField) {
        if (field.get('type') === 'submit') {
          field.emitClick();
          return false; // exit loop
        }
      }
    });
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
