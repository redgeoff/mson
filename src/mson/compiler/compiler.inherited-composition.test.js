// NOTE: the tests in this file must maintain parity with component.inherited-composition.test.js

import testUtils from '../test-utils';
import utils from '../utils';
import compiler from './compiler';

const firstName = utils.uuid();
const addMiddleName = utils.uuid();
const addLastName = utils.uuid();

beforeAll(() => {
  // Uses inheritance
  compiler.registerComponent(firstName, {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      }
    ]
  });

  // Uses composition
  compiler.registerComponent(addMiddleName, {
    component: 'WrappedComponent',
    fields: [
      {
        name: 'middleName',
        component: 'TextField'
      }
    ]
  });

  // Uses inheritance and supplies the componentToWrap dynamically
  compiler.registerComponent(addLastName, {
    component: addMiddleName,
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'addLastNameWrappedComponent',
          component: 'Field'
        }
      ]
    },
    componentToWrap: {
      component: firstName
    },
    fields: [
      {
        name: 'lastName',
        component: 'TextField'
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent(firstName);
  compiler.deregisterComponent(addMiddleName);
  compiler.deregisterComponent(addLastName);
});

it('should support inherited composition', () => {
  const component = compiler.newComponent({
    component: addLastName
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'middleName', 'lastName'])
  );
});
