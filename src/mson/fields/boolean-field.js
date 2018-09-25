import Field from './field';

export default class BooleanField extends Field {
  _className = 'BooleanField';

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      if (value !== false && value !== true && value !== null) {
        this.setErr('must be true or false');
      }
    }
  }

  getDisplayValue() {
    const value = this.get('value');
    return value ? 'Yes' : 'No';
  }

  // The value is never blank as a falsy value is considered false. This is important as it is used
  // to determine whether the BooleanField's diplay value is shown.
  isValueBlank(/* value */) {
    return false;
  }
}
