import Field from './field';
import Mapa from '../mapa';
import _ from 'lodash';

export default class CompositeField extends Field {
  _bubbleUpTouches(field) {
    // Bubble up the touched events from the children
    field.on('touched', touched => {
      if (touched) {
        let allTouched = true;

        this.eachField(field => {
          if (!field.get('touched')) {
            allTouched = false;
            return false; // exit loop
          }
        });

        if (allTouched) {
          // The parent field is not considered touched until all the child fields have been
          // touched. This prevents prematurely showing errors like "required" errors when the user
          // tabs from first field.
          this.setTouched(true);
        }
      }
    });
  }

  _listenForChangesToField(field) {
    // Merge the value changes from the children into the parent value
    field.on('value', value => {
      // Clone the value as we don't want to modify this._value directly as we want set to be able
      // to detect if the value is changing.
      const clonedValue = !this._value ? {} : _.clone(this._value);
      if (value === null) {
        delete clonedValue[field.get('name')];
      } else {
        clonedValue[field.get('name')] = value;
      }
      this.setValue(_.isEmpty(clonedValue) ? null : clonedValue);
    });

    this._bubbleUpTouches(field);
  }

  _listenForChanges() {
    // Show any errors via the first field
    this.on('err', err => {
      // Is there a 1st field? There won't be one if there aren't any values
      if (this._fields.hasFirst()) {
        this._fields.first().setErr(err);
      }
    });
  }

  _addField(field, name) {
    if (name === undefined) {
      name = field.get('name');
    }

    this._fields.set(name, field);

    // Emit event so that we do things like dynamically adjust the display of fields
    this._emitChange('fields', this._fields);

    this._listenForChangesToField(field);
  }

  _create(props) {
    // We use a Mapa instead of an array as sometimes we need to reference the fields via keys that
    // don't change even when fields are deleted. With arrays, the keys change when we slice the
    // array. We cannot use just a basic object as our fields must preseve order. We cannot use a
    // Map as we need to be able to iterate through the fields beginning with any given field.
    this._fields = new Mapa();

    super._create(props);

    // TODO: move to set?
    if (props.fields) {
      props.fields.forEach(field => this._addField(field));
    }

    this._listenForChanges();
  }

  _setForAllFields(props) {
    this.eachField(field => field.set(props));
  }

  _setValue(value) {
    super._setValue(value);
    this.eachField(field =>
      field.setValue(
        value && value[field.get('name')] ? value[field.get('name')] : null
      )
    );
  }

  _setRequired(required) {
    super._setRequired(required);
    this._setForAllFields({ required });
  }

  _setDisabled(disabled) {
    super._setDisabled(disabled);
    this.eachField(field => field.set({ disabled }));
  }

  _setEditable(editable) {
    super._setEditable(editable);
    this.eachField(field => field.set({ editable }));
  }

  _setDirty(dirty) {
    super._setDirty(dirty);
    this.eachField(field => field.set({ dirty }));
  }

  set(props) {
    super.set(props);
    this.eachField(field => this._setIfUndefinedProp(props, field.get('name')));
  }

  getField(name) {
    return this._fields.get(name);
  }

  _getFieldIfExists(name) {
    if (this._fields.has(name)) {
      return this.getField(name);
    }
  }

  getOne(name) {
    const value = this._getFieldIfExists(name);
    return value === undefined ? super.getOne(name) : value;
  }

  eachField(onField) {
    this._fields.each((field, name, last) => onField(field, name, last));
  }

  mapFields(onField) {
    return this._fields.map((field, name, last) => onField(field, name, last));
  }

  clearErr() {
    super.clearErr();
    this.eachField(field => field.clearErr());
  }

  setTouched(touched) {
    super.setTouched(touched);
    this.eachField(field => field.setTouched(touched));
  }

  _validateField(field /*, name, last */) {
    field.validate();
  }

  validate() {
    super.validate();
    this.eachField((field, name, last) =>
      this._validateField(field, name, last)
    );
  }

  getDisplayValue() {
    if (this.isBlank()) {
      return null;
    } else {
      return this.mapFields(field => field.getDisplayValue());
    }
  }
}
