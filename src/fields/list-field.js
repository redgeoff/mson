// NOTE: We opt to delete the fields instead of just hide them as this should allow for better reuse
// of resources

import CompositeField from './composite-field';
import utils from '../utils';

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
            name: 'fieldFactory',
            component: 'Field',
            required: true
          },
          {
            name: 'allowScalar',
            component: 'BooleanField'
          },
          {
            name: 'singularLabel',
            component: 'TextField',
            label: 'Singular Label',
            docLevel: 'basic'
          },
          {
            name: 'autoCreateFields',
            component: 'BooleanField'
          },
          {
            name: 'startWithField',
            component: 'BooleanField'
          },
          {
            name: 'canDeleteEmpty',
            component: 'BooleanField'
          },
          {
            name: 'hideDeleteButton',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      allowDelete: true,
      startWithField: props.fieldFactory,
      canDeleteEmpty: true
    });
  }

  constructor(props) {
    super(props);

    if (this.get('startWithField')) {
      // Create the first field. We do this here and not in _create() as we may need the schema and
      // properties.
      this._createNewField();
    }
  }

  _createNewField() {
    this.createField();
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
    if (this._fields.length() === 1) {
      // There is only 1 field so just clear the value
      field.clearValue();
    } else {
      const name = field.get('name');

      this._removeFieldByName(name);

      // Prevent listener leaks
      field.destroy();
    }

    this.emitChangeToField(field);

    this._calcValue();

    // Create a new field if we have reached the max size and delete a field
    if (
      this.get('autoCreateFields') &&
      !this._isLastFieldBlank() &&
      this.canAddMoreFields()
    ) {
      this.createField();
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

  createField() {
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
      return this.createField();
    } else {
      return this._getField(name);
    }
  }

  _calcValue() {
    // The field is now dirty. We emit this before emitting the value as we want the parent to have
    // a chance to be dirtied so that an auto validation has a chance to fire a canSubmit event.
    this.set({ dirty: true });

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
            field = this.createField();
          }
          field.setValue(val);
          name = field.get('name');
        });
      }
    }

    this._cleanUpNextFields(name);
  }

  _setDirty(dirty) {
    super._setDirty(dirty);
    this.eachField(field => field.set({ dirty }));
  }

  setTouched(touched) {
    super.setTouched(touched);
    this.eachField(field => field.setTouched(touched));
  }

  set(props) {
    super.set(props);

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

      // TODO: forbidDuplicates
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

  produce() {
    // Note: a previous design cloned an instance of a field to generate a new field. Cloning a
    // field is VERY slow, it requires a recursive dive into the instance because the original class
    // structure isn't immediately recoverable once a class has been instantiated. Instead, it is
    // much faster to generate a field via a factory. In addition, the clone method leads to race
    // conditions such as where the the didCreate event is never fired on a sub field of the cloned
    // field.
    const factory = this.get('fieldFactory');
    return factory.produce();
  }

  _newField(index) {
    const field = this.produce();

    field.set({
      name: index,
      ...this.get([
        'required',
        'block',
        'fullWidth',
        'useDisplayValue',
        'editable'
      ])
    });

    return field;
  }

  _clearFields() {
    this._fields.clear();
    this._nextFieldName = 0;
  }

  getSingularLabel() {
    if (this.get('singularLabel')) {
      return this.get('singularLabel');
    } else if (this.get('label')) {
      return utils.toSingular(this.get('label'));
    } else {
      return null;
    }
  }
}
