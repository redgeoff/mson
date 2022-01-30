// NOTE: the tests in this file must maintain parity with compiler.dynamic.test.js

import testUtils from '../utils/test-utils';
import Form from '../form';
import { TextField } from '../fields';
import WrappedComponent from './wrapped-component';

class DynamicForm extends Form {
  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'firstField',
            component: 'Field',
          },
          {
            name: 'secondFieldName',
            component: 'TextField',
          },
        ],
      },
      fields: [
        props.firstField,
        new TextField({
          name: props.secondFieldName,
        }),
      ],
    });
  }
}

class DynamicFormExtended extends DynamicForm {
  create(props) {
    super.create(
      Object.assign({}, props, {
        firstField: new TextField({
          name: 'firstName',
        }),
        secondFieldName: 'lastName',
      })
    );
  }
}

class DynamicCompositionForm extends WrappedComponent {
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

class DynamicCompositionComponent extends WrappedComponent {
  create(props) {
    super.create(
      Object.assign({}, props, {
        componentToWrap: new DynamicCompositionForm({
          componentToWrap: props.baseForm,
        }),
      })
    );

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'baseForm',
            component: 'Field',
          },
        ],
      },
      fields: [
        new TextField({
          name: 'lastName',
        }),
      ],
    });
  }
}

class DynamicCompositionExtendedComponent extends DynamicCompositionComponent {
  create(props) {
    super.create(props);

    this.set({
      fields: [
        new TextField({
          name: 'suffix',
        }),
      ],
    });
  }
}

it('should support dynamic components', () => {
  const component = new DynamicFormExtended();
  expect(component.mapFields((field) => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );
});

it('should support dynamic composition', () => {
  const component = new DynamicCompositionComponent({
    baseForm: new Form({
      fields: [
        new TextField({
          name: 'firstName',
        }),
      ],
    }),
  });
  expect(component.mapFields((field) => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'middleName', 'lastName'])
  );
});

it('should support inhertiance of dynamic composition', () => {
  const component = new DynamicCompositionExtendedComponent({
    baseForm: new Form({
      fields: [
        new TextField({
          name: 'firstName',
        }),
      ],
    }),
  });
  expect(component.mapFields((field) => field.get('name'))).toEqual(
    testUtils.defaultFields.concat([
      'firstName',
      'middleName',
      'lastName',
      'suffix',
    ])
  );
});
