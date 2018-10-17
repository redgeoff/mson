import Field from './field';
import DateField from './date-field';
import isValid from 'date-fns/isValid';

export default class TimeField extends Field {
  _className = 'TimeField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'showSeconds',
            component: 'BooleanField',
            label: 'Show Seconds',
            docLevel: 'basic'
          }
        ]
      }
    });
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert Date? We store dates in epoch time so that they are compatiable across all stores.
    // Epoch time is also smaller than the ISO string and can therefore minimize the storage needed.
    if (
      clonedProps.value !== undefined &&
      typeof clonedProps.value !== 'number'
    ) {
      clonedProps.value = DateField.toEpochTime(clonedProps.value);
    }

    super.set(clonedProps);
  }

  // For mocking
  _toLocaleString(date) {
    const currentLocale = [];
    let options = {};
    if (!this.get('showSeconds')) {
      options = {
        hour: '2-digit',
        minute: '2-digit'
      };
    }
    return date.toLocaleTimeString(currentLocale, options);
  }

  getDisplayValue() {
    return this.isBlank()
      ? null
      : this._toLocaleString(new Date(this.getValue()));
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      const date = new Date(value);

      if (!isValid(date)) {
        this.setErr('invalid');
      }
    }
  }
}
