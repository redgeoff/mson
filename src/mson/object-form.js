import Form from './form';

// A generic object without any required structure
export default class ObjectForm extends Form {
  _className = 'ObjectForm';

  constructor(props) {
    super(props);
    this._errorFromSet = null;
  }

  _create(props) {
    super._create(Object.assign(props, { omitDefaultFields: true }));

    // The fields are dynamic so we need to disable the undefined check
    this._set('reportUndefined', false);
  }

  setValues(values) {
    super.setValues(values);

    this._errorFromSet = null;
    this._valueSet = values;
  }

  // Needed as value is not stored in value property
  isBlank() {
    return this._valueSet ? false : true;
  }

  getErrs() {
    let errs = super.getErrs();
    if (this._errorFromSet !== null) {
      errs = errs.concat({ error: this._errorFromSet });
    }
    return errs;
  }
}
