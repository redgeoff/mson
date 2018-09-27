// NOTE: We opt to delete the fields instead of just hide them as this should allow for better reuse
// of resources

import CompositeField from './composite-field';

export default class ListField extends CompositeField {
  _className = 'ListField';

  _create(props) {
    super._create(props);

    this._nextFieldName = 0;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'allowDelete',
            component: 'BooleanField'
          },
          {
            name: 'minSize',
            component: 'IntegerField'
          },
          {
            name: 'maxSize',
            component: 'IntegerField'
          },
          {
            name: 'field',
            component: 'Field'
          },
          {
            name: 'allowScalar',
            component: 'BooleanField'
          }
        ]
      }
    });
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

    this.emitChangeToField(field);

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

  _getField(name) {
    return this._fields.get(name);
  }

  _removeFieldByName(name) {
    return this._fields.delete(name);
  }

  _onFieldCreated(field /*, onDelete */) {
    field.on('value', value => {
      this._calcValue();
    });
  }

  _getNextFieldName() {
    return this._nextFieldName++;
  }

  _handleDirtyFactory() {
    return dirty => {
      // Bubble up dirty event
      if (dirty) {
        this.set({ dirty: true });
      }
    };
  }

  _createField() {
    const name = this._getNextFieldName();

    const field = this._newField(name);

    const onDelete = () => {
      this._removeField(field);
    };

    field.on('delete', onDelete);

    field.on('dirty', this._handleDirtyFactory());

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
    this.emitChange('value', this._value);
  }

  _listenForChangesToField(field) {
    this._bubbleUpTouches(field);
  }

  _setRequired(required) {
    super._setRequired(required);
    if (this._fields.hasFirst()) {
      this._fields.first().set({ required });
    }
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

  _validateValueType(value) {
    let hasError = false;

    if (value === null || Array.isArray(value) || this.get('allowScalar')) {
      // No error
    } else {
      hasError = true;
    }

    this._hasTypeError = hasError;
  }

  _setValue(value) {
    super._setValue(value);

    this._validateValueType(value);

    let name = null;

    if (!this._hasTypeError) {
      const fields = this._fields.values();
      let values = null;

      if (Array.isArray(value)) {
        values = value;
      } else if (this.get('allowScalar')) {
        values = [value];
      }

      if (values !== null) {
        values.forEach(val => {
          let field = fields.next().value;
          if (!field) {
            field = this._createField();
          }
          field.setValue(val);
          name = field.get('name');
        });
      }
    }

    this._cleanUpNextFields(name);
  }

  set(props) {
    super.set(props);

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
  }

  validate() {
    this.clearErr();

    super.validate();

    let errors = [];

    if (this._hasTypeError) {
      errors.push({ error: 'must be an array' });
    } else {
      // We only want to proceed to validate the fields after we know there is no type error as type
      // errors can result in field errors and we want to report the root issue.
      for (const field of this._fields.values()) {
        field.validate();
        if (field.hasErr()) {
          errors.push({
            field: field.get('name'),
            error: field.getErr()
          });
        }
      }

      const value = this.getValue();

      // We use value and not isBlank() as the values can be out of sync
      if (value) {
        const minSize = this.get('minSize');
        const maxSize = this.get('maxSize');

        if (minSize !== null && value.length < minSize) {
          errors.push({
            error: `${minSize} or more`
          });
        } else if (maxSize !== null && value.length > maxSize) {
          errors.push({
            error: `${maxSize} or less`
          });
        }
      }

      // TODO: allowDuplicates
    }

    if (errors.length > 0) {
      this.setErr(errors);
    }
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

  _newField(index) {
    const field = this.get('field');

    if (!field) {
      throw new Error('must define a field');
    }

    const clonedField = field.clone();

    clonedField.set({
      name: index,
      label: index === 0 ? this.get('label') : undefined,
      required: false,
      block: this.get('block'),
      fullWidth: this.get('fullWidth')
    });

    return clonedField;
  }

  _clearFields() {
    this._fields.clear();
    this._nextFieldName = 0;
  }
}
