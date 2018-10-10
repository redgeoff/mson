import testUtils from '../test-utils';
import { Compiler } from './compiler';
import components from '../components';

let compiler = null;

beforeEach(() => {
  compiler = new Compiler({ components: Object.assign({}, components) });
});

const factoryShouldCreateUniqueForms = factory => {
  const form1 = factory.produce();

  const form2 = factory.produce();

  // Make sure the form object isn't shared
  form1.setValues({
    id: 'ella',
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  });

  form2.setValues({
    id: 'nina',
    firstName: 'Nina',
    lastName: 'Simone'
  });

  expect(form1.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    id: 'ella',
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  });

  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    id: 'nina',
    firstName: 'Nina',
    lastName: 'Simone'
  });
};

it('should compile when factory is in the root of the definition', () => {
  const FormFactory = compiler.compile({
    name: 'app.FormFactory',
    component: 'Factory',
    product: {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField'
        },
        {
          name: 'lastName',
          component: 'TextField'
        }
      ]
    }
  });

  const formFactory = new FormFactory();

  factoryShouldCreateUniqueForms(formFactory);

  expect(formFactory.getClassName()).toEqual('Factory');
});

it('should handle template parameters in a nested factory', () => {
  compiler.registerComponent('app.MyComponent', {
    component: 'CollectionField',
    formFactory: {
      component: 'Factory',
      product: {
        component: 'Form',
        fields: [
          {
            name: 'firstName',
            component: 'TextField',
            label: '{{label}}'
          },
          {
            name: 'lastName',
            component: 'TextField'
          }
        ]
      }
    }
  });

  const component = compiler.newComponent({
    component: 'app.MyComponent',
    label: 'My Label'
  });

  const factory = component.get('formFactory');

  factoryShouldCreateUniqueForms(factory);

  const form = factory.produce();
  expect(form.getField('firstName').get('label')).toEqual('My Label');
});

it('should support composition of factory', () => {
  const Component = compiler.compile({
    component: 'Factory',
    product: {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField'
        }
      ]
    },
    properties: {
      fields: [
        {
          name: 'lastName',
          component: 'TextField'
        }
      ]
    }
  });

  const component = new Component();

  const form = component.produce();
  expect(form.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );

  factoryShouldCreateUniqueForms(component);
});

it('should support dynamic composition of factory', () => {
  compiler.registerComponent('app.MyComponent', {
    component: 'Factory',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'formFactory',
          component: 'Field'
        }
      ]
    },
    product: '{{formFactory}}',
    properties: {
      fields: [
        {
          name: 'lastName',
          component: 'TextField'
        }
      ]
    }
  });

  const component = compiler.newComponent({
    component: 'app.MyComponent',
    formFactory: {
      component: 'Factory',
      product: {
        component: 'Form',
        fields: [
          {
            name: 'firstName',
            component: 'TextField'
          }
        ]
      }
    }
  });

  const form = component.produce();
  expect(form.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );

  factoryShouldCreateUniqueForms(component);
});

it('should support dynamic composition of nested factory', async () => {
  compiler.registerComponent('app.MyComponent', {
    component: 'Component',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'formFactory',
          component: 'Field'
        },
        {
          name: 'baseFormFactory',
          component: 'Field'
        }
      ]
    },
    formFactory: {
      component: 'Factory',
      product: '{{baseFormFactory}}',
      properties: {
        fields: [
          {
            name: 'lastName',
            component: 'TextField'
          }
        ],
        listeners: [
          {
            event: 'foo',
            actions: [
              {
                component: 'Set',
                name: 'value',
                value: {
                  firstName: 'Alexander',
                  lastName: 'Hamilton'
                }
              },
              {
                component: 'Emit',
                event: 'didFoo'
              }
            ]
          }
        ]
      }
    }
  });

  const component = compiler.newComponent({
    component: 'app.MyComponent',
    baseFormFactory: {
      component: 'Factory',
      product: {
        component: 'Form',
        fields: [
          {
            name: 'firstName',
            component: 'TextField'
          }
        ]
      }
    }
  });

  const factory = component.get('formFactory');
  const form = factory.produce();
  expect(form.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );

  factoryShouldCreateUniqueForms(factory);

  // Verify that events in wrapping factory apply to the product
  const didFoo = testUtils.once(form, 'didFoo');
  form.emitChange('foo');
  await didFoo;
  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Alexander',
    lastName: 'Hamilton'
  });
});
