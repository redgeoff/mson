import Field from './field';

export default class TextField extends Field {
  _create(props) {
    super._create(props);
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'minLength',
            component: 'IntegerField'
          },
          {
            name: 'maxLength',
            component: 'IntegerField'
          },
          {
            name: 'minWords',
            component: 'IntegerField'
          },
          {
            name: 'maxWords',
            component: 'IntegerField'
          },
          {
            // TODO: define list of acceptable values
            name: 'type',
            component: 'TextField'
          }
        ]
      }
    });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(
      props,
      'minLength',
      'maxLength',
      'minWords',
      'maxWords',
      'type',
      'invalidRegExp'
    );
  }

  getOne(name) {
    const value = this._getIfAllowed(
      name,
      'minLength',
      'maxLength',
      'minWords',
      'maxWords',
      'type',
      'invalidRegExp'
    );
    return value === undefined ? super.getOne(name) : value;
  }

  _toValidatorProps() {
    const value = this.get('value');

    return {
      ...super._toValidatorProps(),
      length: value ? value.length : null,
      words: value ? value.split(/\s+/).length : null
    };
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      if (typeof value === 'string') {
        const minLength = this.get('minLength');
        const maxLength = this.get('maxLength');
        const invalidRegExp = this.get('invalidRegExp');

        if (minLength !== null && value.length < minLength) {
          this.setErr(`${minLength} characters or more`);
        } else if (maxLength !== null && value.length > maxLength) {
          this.setErr(`${maxLength} characters or less`);
        } else if (invalidRegExp && new RegExp(invalidRegExp).test(value)) {
          this.setErr(`invalid`);
        }
      } else {
        this.setErr(`must be a string`);
      }
    }

    // TODO: minWords, maxWords
  }
}
