import Field from './field';

export default class BooleanField extends Field {
  _className = 'BooleanField';

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      if (value !== false && value !== true) {
        this.setErr('must be true or false');
      }
    }
  }

  getDisplayValue() {
    const value = this.get('value');
    return value ? 'Yes' : 'No';
  }
}
