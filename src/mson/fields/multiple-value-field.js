import Field from './field';

export default class MultipleValueField extends Field {
  _create(props) {
    super._create(props);

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
            name: 'allowScalar',
            component: 'BooleanField'
          }
        ]
      }
    });
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

  setValue(value) {
    this._validateValueType(value);
    super.setValue(value);
  }

  set(props) {
    super.set(props);

    this._setIfUndefined(props, 'minSize', 'maxSize', 'field', 'allowScalar');
  }

  getOne(name) {
    const value = this._getIfAllowed(
      name,
      'minSize',
      'maxSize',
      'field',
      'allowScalar'
    );
    return value === undefined ? super.getOne(name) : value;
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
}
