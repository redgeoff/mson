// NOTE: the tests in this file must maintain parity with compiler.inherited-composition.test.js

import Form from '../form';
import { TextField } from '../fields';
import WrappedComponent from './wrapped-component';
import testUtils from '../utils/test-utils';

// Uses inheritance
class FirstNameForm extends Form {
  create(props) {
    super.create(props);

    this.set({
      fields: [
        new TextField({
          name: 'firstName',
        }),
      ],
    });
  }
}

// Uses composition
class AddMiddleNameForm extends WrappedComponent {
  create(props) {
    super.create(props);

    this.set({
      fields: [
        new TextField({
          name: 'middleName',
        }),
      ],
    });
  }
}

// Uses inheritance and supplies the componentToWrap dynamically
class AddLastNameForm extends AddMiddleNameForm {
  create(props) {
    super.create(
      Object.assign({}, props, {
        componentToWrap: new FirstNameForm(),
      })
    );

    this.set({
      fields: [
        new TextField({
          name: 'lastName',
        }),
      ],
    });
  }
}

it('should support inherited composition', () => {
  const component = new AddLastNameForm();
  expect(component.mapFields((field) => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'middleName', 'lastName'])
  );
});
