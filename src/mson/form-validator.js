import Form from './form';
import { TextField, FormField } from './fields';

class ValidatorSelector extends Form {
  _create(props) {
    super._create(props);
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
        name: 'selector',
        label: 'Selector',
        form: new ValidatorSelector()
      })
    );

    this.addField(
      new FormField({
        name: 'error',
        label: 'Error',
        form: new ValidatorError()
      })
    );
  }
}
