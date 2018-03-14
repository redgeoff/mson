// NOTE: We opt to delete the fields instead of just hide them as this should allow for better reuse
// of resources

import CompositeField from './composite-field';

export default class ListField extends CompositeField {
  _create(props) {
    super._create(props);
    this._nextFieldName = 0;
  }

  _getValue() {
    let values = [];
    this.eachField(field => {
      const value = field.getValue();
      if (value) {
        values.push(value);
      }
    });
    return values.length > 0 ? values : null;
  }

  _isLastFieldBlank() {
    return this._fields.last().isBlank();
  }

  _removeField(field) {
    const name = field.get('name');

    const firstName = this._fields.firstKey();

    this._removeFieldByName(name);

    // Prevent listener leaks
    field.removeAllListeners();

    // Emit event so that we do things like dynamically adjust the display of fields
    this._emitChange('fields', this._fields);

    this._calcValue();

    // Are we removing the first field?
    if (name === firstName) {
      // Set the label and required for the new first field
      this._fields
        .first()
        .set({ label: field.get('label'), required: field.get('required') });
    }

    // Create a new field if we have reached the max size and delete a field
    if (!this._isLastFieldBlank() && this.canAddMoreFields()) {
      this._createField();
    }
  }

  _hasField(name) {
    return this._fields.has(name);
  }

  _clearFieldIfExists(name) {
    if (this._hasField(name)) {
      this._getField(name).clearValue();
    }
  }

  _shouldRemoveField(/* field */) {
    return true;
  }

  _removeNextFieldsIfExist(name) {
    if (this._hasField(name)) {
      const field = this._getField(name);
      if (this._shouldRemoveField(field)) {
        this._removeField(field);
        const nextName = this._getNextName(name);
        this._removeNextFieldsIfExist(nextName);
      } else {
        this._clearFieldIfExists(name);
      }
    }
  }

  _getField(name) {
    return this._fields.get(name);
  }

  _removeFieldByName(name) {
    return this._fields.delete(name);
  }

  _fieldExists(name) {
    return this._fields.has(name);
  }

  _onFieldCreated(field /*, onDelete */) {
    field.on('value', value => {
      this._calcValue();
    });
  }

  _getNextFieldName() {
    return this._nextFieldName++;
  }

  _createField() {
    const name = this._getNextFieldName();

    const field = this._newField(name);

    const onDelete = () => {
      this._removeField(field);
    };

    field.on('delete', onDelete);

    this._onFieldCreated(field, onDelete);

    this._addField(field, name);

    return field;
  }

  _getOrCreateField(name) {
    if (!this._hasField(name)) {
      return this._createField();
    } else {
      return this._getField(name);
    }
  }

  _calcValue() {
    // Instead of calling setValue(), we set the value directly and then emit an event. This
    // prevents an inifinite loop that would otherwise occur where the setValue() at this layer
    // triggers a setValue() on the child field, triggering a value event on the child field and
    // then back to this layer to cause an inifinite echo. We need to iterate through the entire
    // list each time as the user may have cleared an item.
    //
    // this.setValue(this._getValue());
    this._value = this._getValue();
    this._emitChange('value', this._value);
  }

  _listenForChangesToField(field) {
    this._bubbleUpTouches(field);
  }

  _setRequired(props) {
    if (props.required !== undefined) {
      if (this._fields.hasFirst()) {
        this._fields.first().set({ required: props.required });
      }
    }
  }

  _getNextName(name) {
    if (name === null) {
      return this._fields.firstKey();
    } else {
      return this._fields.nextKey(name);
    }
  }

  _getLastName() {
    return this._fields.lastKey();
  }

  _isFirstField(field) {
    return field.get('name') === this._fields.firstKey();
  }

  _isLastField(field) {
    return field.get('name') === this._fields.lastKey();
  }

  _cleanUpNextFields(afterName) {
    const nextName =
      afterName === null
        ? this._fields.firstKey()
        : this._fields.nextKey(afterName);
    if (nextName !== null) {
      let first = true;
      for (let field of this._fields.values(nextName)) {
        if (first || !this._shouldRemoveField(field)) {
          field.clearValue();
          first = false;
        } else {
          this._removeField(field);
        }
      }
    }
  }

  _setValue(props) {
    if (props.value !== undefined) {
      let name = null;

      if (props.value) {
        const fields = this._fields.values();
        props.value.forEach(value => {
          let field = fields.next().value;
          if (!field) {
            field = this._createField();
          }
          field.setValue(value);
          name = field.get('name');
        });
      }

      this._cleanUpNextFields(name);
    }
  }

  set(props) {
    super.set(props);

    // This needs to come first as we need to set the options and blankString before creating any
    // fields
    this._setIfUndefined(
      props,
      'block',
      'fullWidth',
      'allowDelete',
      'minSize',
      'maxSize'
    );

    if (props.label !== undefined) {
      if (this._fields.hasFirst()) {
        this._fields.first().set({ label: props.label });
      }
    }

    if (props.required !== undefined) {
      if (this._fields.hasFirst()) {
        this._fields.first().set({ required: props.required });
      }
    }

    if (props.block !== undefined) {
      this.eachField(field => field.set({ block: props.block }));
    }

    if (props.fullWidth !== undefined) {
      this.eachField(field => field.set({ fullWidth: props.fullWidth }));
    }
  }

  getOne(name) {
    const value = this._getIfAllowed(
      name,
      'block',
      'fullWidth',
      'allowDelete',
      'minSize',
      'maxSize'
    );
    return value === undefined ? super.getOne(name) : value;
  }

  validate() {
    super.validate();

    const value = this.getValue();

    // We use value and not isBlank() as the values can be out of sync
    if (value) {
      const minSize = this.get('minSize');
      const maxSize = this.get('maxSize');

      if (minSize !== null && value.length < minSize) {
        this.setErr(`${minSize} or more`);
      } else if (maxSize !== null && value.length > maxSize) {
        this.setErr(`${maxSize} or less`);
      }
    }

    // TODO: allowDuplicates
  }

  canAddMoreFields(fieldValue) {
    const maxSize = this.get('maxSize');
    const value = this.getValue();

    let length = value ? value.length : 0;

    // If the fieldValue is truthy then consider this an addition so we have one more field than
    // currently exists
    if (fieldValue) {
      length++;
    }

    if (maxSize !== null && value && length >= maxSize) {
      return false;
    } else {
      return true;
    }
  }
}
