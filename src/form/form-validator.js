import Form from './form';
import TextField from '../fields/text-field';
import FormField from '../fields/form-field';
import WhereField from '../fields/where-field';

class ValidatorError extends Form {
  className = 'ValidatorError';

  create(props) {
    super.create(props);

    this.addField(
      new TextField({
        name: 'field',
        label: 'Field',
        required: true,
      })
    );

    this.addField(
      new TextField({
        name: 'error',
        label: 'error',
        required: true,
      })
    );
  }
}

export default class FormValidator extends Form {
  className = 'FormValidator';

  create(props) {
    super.create(props);

    this.addField(
      new WhereField({
        name: 'where',
        label: 'Where',
        required: true,
      })
    );

    this.addField(
      new FormField({
        name: 'error',
        label: 'Error',
        form: new ValidatorError(),
        required: true,
      })
    );
  }
}
