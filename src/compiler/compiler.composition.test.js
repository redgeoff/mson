import testUtils from '../test-utils';
import compiler from './compiler';

beforeAll(() => {
  compiler.registerComponent('app.FirstNameField', {
    name: 'firstName',
    component: 'TextField',
    maxLength: 10
  });

  compiler.registerComponent('app.NameForm', {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'app.FirstNameField'
      }
    ]
  });

  compiler.registerComponent('app.FooForm', {
    component: 'Form',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'TextField'
        }
      ]
    }
  });

  compiler.registerComponent('app.Composition', {
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.FooForm',
      fields: [
        {
          name: 'yar',
          component: 'TextField'
        }
      ]
    }
  });

  compiler.registerComponent('app.PassedComposition', {
    component: 'WrappedComponent',
    fields: [
      {
        name: 'nar',
        component: 'TextField'
      }
    ],
    foo: 'baz',
    listeners: [
      {
        event: 'create',
        actions: [
          {
            component: 'Set',
            name: 'fields.yar.hidden',
            value: true
          }
        ]
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent('app.FirstNameField');
  compiler.deregisterComponent('app.NameForm');
  compiler.deregisterComponent('app.FooForm');
  compiler.deregisterComponent('app.Composition');
  compiler.deregisterComponent('app.PassedComposition');
});

it('should compile a component with composition', async () => {
  const FirstName = compiler.compile({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'TextField',
      name: 'firstName',
      maxLength: 10
    }
  });

  const firstName = new FirstName();
  expect(firstName.get(['name', 'maxLength'])).toEqual({
    name: 'firstName',
    maxLength: 10
  });
  expect(firstName.getClassName()).toEqual('WrappedComponent');
});

it('should compile a component that extends a component with composition', () => {
  const Component = compiler.compile({
    component: 'app.Composition'
  });

  const component = new Component();
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['yar'])
  );
  expect(component.getClassName()).toEqual('app.Composition');
});

it('should compile a component with composition as a reference', async () => {
  const FirstName = compiler.compile({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.FirstNameField'
    }
  });

  const firstName = new FirstName();
  expect(firstName.get(['name', 'maxLength'])).toEqual({
    name: 'firstName',
    maxLength: 10
  });
  expect(firstName.getClassName()).toEqual('WrappedComponent');
});

it('should instantiate a component with composition', async () => {
  const component = compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.NameForm'
    }
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName'])
  );
});

it('should support composition with inner props', async () => {
  const component = compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.FooForm',
      fields: [
        {
          name: 'nar',
          component: 'TextField'
        }
      ],
      foo: 'bar'
    }
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['nar'])
  );
  expect(component.get('foo')).toEqual('bar');
});

it('should support composition with outer props', async () => {
  const component = compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.FooForm'
    },
    fields: [
      {
        name: 'nar',
        component: 'TextField'
      }
    ],
    foo: 'bar'
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['nar'])
  );
  expect(component.get('foo')).toEqual('bar');
});

it('should support nested composition', async () => {
  const component = compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'WrappedComponent',
      componentToWrap: {
        component: 'app.FooForm',
        fields: [
          {
            name: 'nar',
            component: 'TextField'
          }
        ]
      },
      fields: [
        {
          name: 'yar',
          component: 'TextField'
        }
      ],
      foo: 'baz'
    },
    fields: [
      {
        name: 'jar',
        component: 'TextField'
      }
    ]
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['nar', 'yar', 'jar'])
  );
  expect(component.get('foo')).toEqual('baz');
});

it('should support inheritance of composition', async () => {
  const component = compiler.newComponent({
    component: 'app.Composition',
    fields: [
      {
        name: 'jar',
        component: 'TextField'
      }
    ],
    foo: 'baz'
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['yar', 'jar'])
  );
  expect(component.get('foo')).toEqual('baz');
});

it('should support composition of reference', async () => {
  const component = compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.Composition'
    },
    foo: 'baz'
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['yar'])
  );
  expect(component.get('foo')).toEqual('baz');
});

it('should support passed composition', async () => {
  const component = compiler.newComponent({
    component: 'app.PassedComposition',
    componentToWrap: {
      component: 'app.Composition'
    }
  });
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['yar', 'nar'])
  );
  expect(component.get('foo')).toEqual('baz');

  // Make sure that the create event is emitted after the components are wrapped
  expect(component.getField('yar').get('hidden')).toEqual(false);
  await component.resolveAfterCreate();
  expect(component.getField('yar').get('hidden')).toEqual(true);
});

it('should not mutate original component when composing', async () => {
  compiler.newComponent({
    component: 'WrappedComponent',
    componentToWrap: {
      component: 'app.FooForm'
    },
    fields: [
      {
        name: 'nar',
        component: 'TextField'
      }
    ]
  });

  const component2 = compiler.newComponent({
    component: 'app.FooForm'
  });

  expect(component2.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields
  );
});

it('should not mutate original component when extending a composition', async () => {
  compiler.newComponent({
    component: 'app.Composition',
    fields: [
      {
        name: 'jar',
        component: 'TextField'
      }
    ]
  });

  const component2 = compiler.newComponent({
    component: 'app.Composition'
  });

  expect(component2.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['yar'])
  );
});
