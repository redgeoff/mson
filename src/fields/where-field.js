import FormField from '../fields/form-field';
import { validateQuery } from '../compiler/query';
import ObjectForm from '../object-form';

class ValidatorWhere extends ObjectForm {
  validate() {
    super.validate();

    if (this._valueSet) {
      try {
        // Use sift to validate the where
        validateQuery(this._valueSet);
      } catch (err) {
        this._errorFromSet = err.message;
        this.set({ err: true });
      }
    }
  }
}

export default class WhereField extends FormField {
  _className = 'WhereField';

  _create(props) {
    super._create(props);

    this._setDefaults(props, { form: new ValidatorWhere() });
  }
}
