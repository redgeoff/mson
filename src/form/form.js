import Component from '../component';
import merge from 'lodash/merge';
import each from 'lodash/each';
import Validator from '../component/validator';
import Mapa from '../mapa';
import IdField from '../fields/id-field';
import NumberField from '../fields/number-field';
import DateField from '../fields/date-field';
import ButtonField from '../fields/button-field';
import ComponentFillerProps from '../component/component-filler-props';
import ComponentField from '../fields/component-field';
import FormField from '../fields/form-field';
import FormErr from './form-err';
import ExtendedField from '../fields/extended-field';

export default class Form extends Component {
  _className = 'Form';

  _formSetMSONSchema() {
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'fields',
            component: 'CollectionField',
            // required: true,
            formFactory: {
              component: 'Factory',
              product: {
                component: 'SchemaValidatorForm'
              }
            }
          },
          {
            // TODO: can't this be removed?
            name: 'form',
            component: 'Field'
          },
          {
            name: 'validators',
            component: 'CollectionField',
            formFactory: {
              component: 'Factory',
              product: {
                component: 'ValidatorForm'
              }
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
            // component: 'CollectionField',
            // form: {
            //   // TODO: create and use IndexForm. Needs to verfiy that fields are present--see
            //   // SchemaValidatorForm for something similar.
            //   component: 'IndexForm'
            // }
          },
          {
            name: 'touched',
            component: 'BooleanField'
          },
          {
            name: 'err',
            component: 'Field'
          },
          {
            name: 'dirty',
            component: 'BooleanField'
          },
          {
            name: 'pristine',
            component: 'BooleanField'
          },
          {
            name: 'autoValidate',
            component: 'BooleanField'
          },
          {
            name: 'reportUndefined',
            component: 'BooleanField'
          },
          {
            name: 'resetOnLoad',
            component: 'BooleanField'
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
            name: 'cursor',
            component: 'TextField'
          },
          {
            name: 'snapshot',
            component: 'BooleanField'
          },
          {
            name: 'mode',
            component: 'TextField'
          },
          {
            name: 'isLoading',
            component: 'BooleanField'
          },
          {
            name: 'omitDefaultFields',
            component: 'BooleanField'
          },
          {
            name: 'value',
            component: 'Field'
          },
          {
            name: 'clear',
            component: 'BooleanField'
          },
          {
            name: 'reset',
            component: 'BooleanField'
          },
          {
            name: 'fullWidth',
            component: 'BooleanField'
          },
          {
            name: 'editable',
            component: 'BooleanField'
          },
          {
            name: 'hidden',
            component: 'BooleanField'
          },
          {
            name: 'required',
            component: 'BooleanField'
          },
          {
            name: 'out',
            component: 'BooleanField'
          },
          {
            name: 'disabled',
            component: 'BooleanField'
          },
          {
            name: 'eachField',
            component: 'Field'
          },
          {
            // Used to disable the submit action on the form so that when the user clicks a submit
            // button on a nested form, it doesn't also trigger a submit on the parent form. This
            // can occur when using type=submit when there are multiple forms.
            name: 'disableSubmit',
            component: 'BooleanField'
          },
          {
            name: 'useDisplayValue',
            component: 'BooleanField'
          },
          {
            name: 'change',
            component: 'Field'
          },
          {
            name: 'clearErrs',
            component: 'BooleanField'
          }
        ]
      }
    });
  }

  _create(props) {
    super._create(props);

    this._componentFillerProps = new ComponentFillerProps();
    this._fields = new Mapa();
    this._defaultFields = new Mapa();
    this._validators = [];
    this._clearExtraErrors();

    if (!props || !props.omitDefaultFields) {
      this._addDefaultFields();
      this._createDefaultFields();
    }

    this._formSetMSONSchema();

    this._setDefaults(props, {
      // We default this to false as otherwise there is a lot of extra overhead incurred whenever we
      // set a value-especially when setting values at the top-most component.
      autoValidate: false,

      // Whether or not to report errors when an undefined (extra) field is specified
      reportUndefined: true,

      // If true, the form is reset on load
      resetOnLoad: true,

      // Only show non-archived
      showArchived: false
    });

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

  _handleLoadFactory() {
    return () => {
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
    };
  }

  _listenForLoad() {
    this.on('load', this._handleLoadFactory());
  }

  _listenForUnload() {
    this.on('unload', () => {
      // Revert to some defaults
      this.set({ showArchived: false, searchString: null });

      // Pass unload event down to fields
      this._fields.each(field => field.emitUnload());
    });
  }

  _handleShowArchivedFactory() {
    return showArchived => {
      // Pass event down to fields
      this._fields.each(field => field.set({ showArchived }));
    };
  }

  _listenForShowArchived() {
    this.on('showArchived', this._handleShowArchivedFactory());
  }

  _handleSearchStringFactory() {
    return searchString => {
      // Pass event down to fields
      this._fields.each(field => field.set({ searchString }));
    };
  }

  _listenForSearchString() {
    this.on('searchString', this._handleSearchStringFactory());
  }

  _handleScrollFactory() {
    return e => {
      // Pass scroll event down to fields
      //
      // TODO: why isn't the following working?
      // this._fields.each(field => field.emit('scroll', e));
      this._fields.each(field => {
        field.emit('scroll', e);
      });
    };
  }

  _listenForScroll() {
    this.on('scroll', this._handleScrollFactory());
  }

  isDefaultField(fieldName) {
    return this._defaultFields.has(fieldName);
  }

  _addDefaultFields() {
    // Default fields are hidden by default but accompany the form and allow for special
    // functionality, e.g. whether an archived form should be displayed. These fields exist as
    // fields and not properties on the form as this allows us to override the display of things
    // like creation dates. Moreover, default fields allow for the automatic formatting of things
    // like dates for stores like Firebase, which would otherwise destroy the formatting of our
    // dates.

    this._defaultFields.set(
      'id',
      new IdField({ name: 'id', label: 'Id', hidden: true })
    );

    this._defaultFields.set(
      'userId',
      new IdField({ name: 'userId', label: 'User Id', hidden: true })
    );

    this._defaultFields.set(
      'createdAt',
      new DateField({ name: 'createdAt', label: 'Created At', hidden: true })
    );

    this._defaultFields.set(
      'updatedAt',
      new DateField({ name: 'updatedAt', label: 'Updated At', hidden: true })
    );

    this._defaultFields.set(
      'archivedAt',
      new DateField({
        name: 'archivedAt',
        label: 'Archived At',
        hidden: true
      })
    );

    this._defaultFields.set(
      'order',
      new NumberField({ name: 'order', label: 'Order', hidden: true })
    );
  }

  _createDefaultFields() {
    this._defaultFields.each(field => this.addField(field));
  }

  copyFields(form, clone) {
    const fields = [];
    form._fields.each(field => {
      if (!this.isDefaultField(field.get('name'))) {
        this.addField(clone ? field.clone() : field);
        fields.push(field);
      }
    });
    this._emitChangeToFields(fields);
  }

  cloneFields(form) {
    this.copyFields(form, true);
  }

  elevate(form) {
    this.copyFields(form);
    this.set({
      validators: form.get('validators'),
      listeners: form.get('listeners')
    });
  }

  _clearExtraErrors() {
    this._extraErrors = [];
  }

  _setAccess(access) {
    // Merge access recursively
    this._set('access', merge(this._access, access));
  }

  _emitChangeToFields(change) {
    // Emit change so that UI is notified
    this.set({ change });
  }

  set(props) {
    // Add fields before calling super.set so that listeners are added after the fields
    if (props.fields !== undefined) {
      props.fields.forEach(field => {
        this.addField(field);
      });
      this._emitChangeToFields(props.fields);
    }

    super.set(
      Object.assign({}, props, {
        fields: undefined,
        validators: undefined,
        access: undefined,
        value: undefined,
        clear: undefined,
        reset: undefined,
        fullWidth: undefined,
        // editable: undefined, // TODO: should other props be removed as well?
        hidden: undefined,
        required: undefined,
        out: undefined,
        disabled: undefined,
        setForEachField: undefined,
        useDisplayValue: undefined
      })
    );

    if (props.validators !== undefined) {
      this._validators = [];
      props.validators.forEach(validator => {
        this.addValidator(validator);
      });
    }

    if (props.value !== undefined) {
      this.setValues(props.value);
    }

    if (props.required !== undefined) {
      this.setRequired(props.required);
    }

    if (props.disabled !== undefined) {
      this.setDisabled(props.disabled);
    }

    if (props.editable !== undefined) {
      this.setEditable(props.editable);
    }

    if (props.hidden !== undefined) {
      this.setHidden(props.hidden);
    }

    if (props.out !== undefined) {
      this.setOut(props.out);
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

    if (props.access !== undefined) {
      this._setAccess(props.access);
    }

    if (props.fullWidth !== undefined) {
      this._setFullWidth(props.fullWidth);
    }

    if (props.eachField !== undefined) {
      this.setForEachField(props.eachField);
    }

    if (props.useDisplayValue !== undefined) {
      this.setUseDisplayValue(props.useDisplayValue);
    }

    if (props.clearErrs === true) {
      this.clearErrs();
    }
  }

  _setField(field) {
    // Make sure the before field is present
    const before = field.get('before');
    const beforeName = before && this.hasField(before) ? before : undefined;

    // Make sure the after field is present
    const after = field.get('after');
    const afterName = after && this.hasField(after) ? after : undefined;

    this._fields.set(field.get('name'), field, beforeName, afterName);
  }

  _handleFieldTouchedFactory() {
    return touched => {
      if (touched) {
        this.set({ touched: true });
      }
      if (this.get('autoValidate')) {
        this.validate();
      }
    };
  }

  _addField(field) {
    this._setField(field);

    // TODO: need to consider that field already exists. Also need to worry about cleaning up any
    // existing listeners when this happens?

    field.on('value', fieldValue => {
      // We use _set() as if we used set() then we would trigger an infinite loop
      const value = this._value ? this._value : {};
      value[field.get('name')] = fieldValue;
      this._set('value', value); // Doesn't trigger event as shallow compare
      this.emitChange('value', value);

      if (this.get('autoValidate')) {
        this.validate();
      }
    });

    field.on('touched', this._handleFieldTouchedFactory());

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
      this.emitChange(field.get('name'));
    });

    field.set({ parent: this });
  }

  addField(field) {
    // Not a field? We have to use the existence of isField instead of `instanceof Field` as a
    // wrapped field, e.g. a MSONComponent will fail the instanceof test, but is still a field.
    if (!field.isField) {
      if (this.isComponent(field)) {
        // Wrap the component in a ComponentField so that we can use any component in the form
        field = new ComponentField({
          name: field.get('name'),
          content: field
        });
      } else {
        field = new ExtendedField({
          name: field.name,
          properties: Object.assign({}, field, { name: undefined })
        });
      }
    }

    if (field instanceof ExtendedField && this.hasField(field.get('name'))) {
      this.getField(field.get('name')).set(field.get('properties'));
      return;
    }

    if (field instanceof FormField && field.get('elevate')) {
      this.elevate(field.get('form'));
    } else {
      this._addField(field);
    }
  }

  removeField(name) {
    const field = this.getField(name);

    this._fields.delete(name);

    // Prevent a listener leak
    field.destroy();
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

    return super.getOne(name);
  }

  getField(name) {
    try {
      return this._fields.get(name);
    } catch (err) {
      throw new Error('missing field ' + name);
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
      if (values === null) {
        this.clearValues();
      } else {
        each(values, (value, name) => {
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
    return this;
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
    this.emitChange(canSubmit ? 'canSubmit' : 'cannotSubmit');
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
    this._fields.each(field => field.set({ touched }));
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

  setOut(out) {
    this._fields.each(field => field.set({ out }));
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

  _setFullWidth(fullWidth) {
    this._fields.each(field => field.set({ fullWidth }));
  }

  clone() {
    // It is much faster to call field.clone() instead of doing a cloneDeep of field as
    // field.clone() can use field._cloneFast()

    const clonedFields = this.mapFields(field => field.clone());

    let opts = {};
    const canCloneFast = this._canCloneFast();

    if (canCloneFast) {
      // We exclude the fields from the deep clone and clone them manually
      opts = {
        defaultProps: {
          fields: clonedFields
        },
        excludeProps: ['fields']
      };
    }

    const clonedForm = this._clone(opts);

    if (!canCloneFast) {
      clonedForm.set({ fields: clonedFields });
    }

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

  _emitClickOnButton(button) {
    button.emitClick();
  }

  submit() {
    const button = this._getSubmitButton();
    if (button) {
      this._emitClickOnButton(button);
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

    // Wrap factory so that it sets the compiler
    const formFactory = form.getField('fields').get('formFactory');
    const product = formFactory.get('product');
    formFactory.set({
      product: () => {
        const form = product();
        form.set({ compiler });
        return form;
      }
    });

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

      if (values.component) {
        // Get inherited fields
        const extendedForm = compiler.newComponent({
          component: values.component
        });
        extendedForm.eachField(field => fieldNames.push(field.get('name')));
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

  // TODO: refactor calls in this class to use setForEachField when possible
  setForEachField(props) {
    this._fields.each(field => field.set(props));
  }

  setUseDisplayValue(useDisplayValue) {
    this.setForEachField({ useDisplayValue });
  }

  destroy() {
    super.destroy();
    this.eachField(field => field.destroy());
  }

  setFieldErr(fieldName, err) {
    this.getField(fieldName).setErr(err);
  }

  toErr() {
    return new FormErr({ form: this });
  }

  setFieldErrAndThrow(fieldName, err) {
    this.setFieldErr(fieldName, err);
    throw this.toErr();
  }
}
