import Form from './form';
import TextField from '../fields/text-field';
import FormField from '../fields/form-field';
import sift from 'sift';
import ObjectForm from '../object-form';

export class ValidatorWhere extends ObjectForm {
  validate() {
    super.validate();

    if (this._valueSet) {
      try {
        // Use sift to validate the where
        sift(this._valueSet);
      } catch (err) {
        this._errorFromSet = err.message;
        this.set({ err: true });
      }
    }
  }
}

class ValidatorError extends Form {
  _create(props) {
    super._create(props);

    this.addField(
      new TextField({
        name: 'field',
        label: 'Field',
        required: true
      })
    );

    this.addField(
      new TextField({
        name: 'error',
        label: 'error',
        required: true
      })
    );
  }
}

export default class FormValidator extends Form {
  _create(props) {
    super._create(props);

    this.addField(
      new FormField({
        name: 'where',
        label: 'Where',
        form: new ValidatorWhere(),
        required: true
      })
    );

    this.addField(
      new FormField({
        name: 'error',
        label: 'Error',
        form: new ValidatorError(),
        required: true
      })
    );
  }
}
