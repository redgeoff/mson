import Field from './field';

export default class SelectField extends Field {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'options', 'blankString');
  }

  getOne(name) {
    // We consider the blank string to be a null value. We have to use isValueBlank() to prevent
    // infinite recursion.
    if (name === 'value' && this.isValueBlank(this._value)) {
      return null;
    }

    const value = this._getIfAllowed(name, 'options', 'blankString');
    return value === undefined ? super.getOne(name) : value;
  }

  _getOptionLabel(value) {
    let label = null;

    if (this._options) {
      this._options.forEach(option => {
        if (option.value === value) {
          label = option.label;
        }
      });
    }

    return label;
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.get('value');
      if (this._getOptionLabel(value) === null) {
        this.setErr(`{value} is not an option`)
      }
    }
  }

  getDisplayValue() {
    const value = this.get('value');
    if (this.isBlank()) {
      return value;
    } else {
      return this._getOptionLabel(value);
    }
  }
}
