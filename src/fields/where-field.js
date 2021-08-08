import FormField from '../fields/form-field';
import { validateQuery } from '../compiler/query';
import ObjectForm from '../object-form';

class ValidatorWhere extends ObjectForm {
  validate() {
    super.validate();

    if (this._valueSet) {
      try {
        validateQuery(this._valueSet);
      } catch (err) {
        this._errorFromSet = err.message;
        this.set({ err: true });
      }
    }
  }
}

export default class WhereField extends FormField {
  className = 'WhereField';

  create(props) {
    super.create(props);

    this._setDefaults(props, { form: new ValidatorWhere() });
  }
}
