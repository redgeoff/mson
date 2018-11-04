import Field from './field';

export default class BooleanField extends Field {
  _className = 'BooleanField';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            // Hide from docs as required doesn't make sense for a BooleanField
            name: 'required',
            docLevel: null
          }
        ]
      }
    });
  }

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

  _setRequired(/* required */) {
    // Do nothing as we don't want to report any errors as this prop doesn't apply
  }
}
