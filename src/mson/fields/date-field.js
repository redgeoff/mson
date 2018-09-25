import TextField from './text-field';
import isValid from 'date-fns/isValid';

export default class DateField extends TextField {
  _className = 'DateField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'now',
            component: 'BooleanField'
          },
          {
            name: 'includeTime',
            component: 'BooleanField'
          },
          {
            name: 'minDate',
            component: 'DateField'
          },
          {
            name: 'maxDate',
            component: 'DateField'
          }
        ]
      }
    });
  }

  now() {
    this.set({ value: new Date() });
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    if (props.now !== undefined) {
      this.now();

      // Clear now so we can trigger it back to back. TODO: is there an automatic way of handling
      // this via some property like ephemeral:true?
      delete clonedProps.now;
    }

    // Convert Date to String? We store dates in ISO String format so that they are compatiable
    // across all stores
    if (props.value !== undefined && props.value instanceof Date) {
      props.value = props.value.toISOString();
    }

    super.set(props);
  }

  // For mocking
  _toLocaleString(date) {
    return this.get('includeTime')
      ? date.toLocaleString()
      : date.toLocaleDateString();
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
      const minDate = this.get('minDate')
        ? new Date(this.get('minDate'))
        : null;
      const maxDate = this.get('maxDate')
        ? new Date(this.get('maxDate'))
        : null;

      if (!isValid(date)) {
        this.setErr(`invalid`);
      } else if (minDate !== null && date.getTime() < minDate.getTime()) {
        this.setErr(`must be after ${this._toLocaleString(minDate)}`);
      } else if (maxDate !== null && date.getTime() > maxDate.getTime()) {
        this.setErr(`must be before ${this._toLocaleString(maxDate)}`);
      }
    }
  }
}
