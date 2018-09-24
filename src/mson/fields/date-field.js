import TextField from './text-field';

export default class DateField extends TextField {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'now',
            component: 'BooleanField'
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
    return date.toLocaleString();
  }

  getDisplayValue() {
    return this.isBlank()
      ? null
      : this._toLocaleString(new Date(this.getValue()));
  }
}
