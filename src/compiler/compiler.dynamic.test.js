// NOTE: the tests in this file must maintain parity with component.dynamic.test.js

import testUtils from '../test-utils';
import utils from '../utils';
import compiler from './compiler';

const dynamicFormName = 'app.DynamicForm.' + utils.uuid();
const dynamicFormExtendedName = 'app.DynamicFormExtended.' + utils.uuid();
const dynamicCompositionFormName =
  'app.DynamicCompositionFormName.' + utils.uuid();
const dynamicCompositionComponentName =
  'app.DynamicCompositionComponent.' + utils.uuid();
const dynamicCompositionExtendedComponentName =
  'app.DynamicCompositionComponentExtended.' + utils.uuid();

beforeAll(() => {
  compiler.registerComponent(dynamicFormName, {
    component: 'Form',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'firstField',
          component: 'Field'
        },
        {
          name: 'secondFieldName',
          component: 'TextField'
        }
      ]
    },
    fields: [
      '{{firstField}}',
      {
        name: '{{secondFieldName}}',
        component: 'TextField'
      }
    ]
  });

  compiler.registerComponent(dynamicFormExtendedName, {
    component: dynamicFormName,
    firstField: {
      component: 'TextField',
      name: 'firstName'
    },
    secondFieldName: 'lastName'
  });

  compiler.registerComponent(dynamicCompositionFormName, {
    component: 'WrappedComponent',
    fields: [
      {
        component: 'TextField',
        name: 'middleName'
      }
    ]
  });

  compiler.registerComponent(dynamicCompositionComponentName, {
    component: 'WrappedComponent',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'baseForm',
          component: 'Field'
        }
      ]
    },
    componentToWrap: {
      component: dynamicCompositionFormName,
      componentToWrap: '{{baseForm}}'
    },
    fields: [
      {
        component: 'TextField',
        name: 'lastName'
      }
    ]
  });

  compiler.registerComponent(dynamicCompositionExtendedComponentName, {
    component: dynamicCompositionComponentName,
    fields: [
      {
        component: 'TextField',
        name: 'suffix'
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent(dynamicFormName);
  compiler.deregisterComponent(dynamicFormExtendedName);
  compiler.deregisterComponent(dynamicCompositionFormName);
  compiler.deregisterComponent(dynamicCompositionComponentName);
  compiler.deregisterComponent(dynamicCompositionExtendedComponentName);
});

it('should support dynamic components', () => {
  const component = compiler.newComponent({
    component: dynamicFormExtendedName
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );
});

it('should support dynamic composition', () => {
  const component = compiler.newComponent({
    component: dynamicCompositionComponentName,
    baseForm: {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField'
        }
      ]
    }
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'middleName', 'lastName'])
  );
});

it('should support inheritance of dynamic composition', () => {
  const component = compiler.newComponent({
    component: dynamicCompositionExtendedComponentName,
    baseForm: {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField'
        }
      ]
    }
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat([
      'firstName',
      'middleName',
      'lastName',
      'suffix'
    ])
  );
});
