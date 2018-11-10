import testUtils from '../test-utils';
import { Compiler } from './compiler';
import components from '../components';

let compiler = null;

const registerNameField = () => {
  compiler.registerComponent('app.NameField', {
    component: 'TextField',
    minLength: 5
  });
};

const registerPersonName = () => {
  compiler.registerComponent('app.Person', {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      }
    ]
  });
};

const registerPersonFullName = () => {
  compiler.registerComponent('app.PersonFullName', {
    component: 'app.Person',
    fields: [
      {
        name: 'lastName',
        component: 'TextField'
      }
    ]
  });
};

beforeEach(() => {
  compiler = new Compiler({ components: Object.assign({}, components) });
});

it('should get compiled component', () => {
  registerNameField();

  const compileSpy = jest.spyOn(compiler, 'compile');

  // Get compiled component
  let Component = compiler.getCompiledComponent('TextField');
  expect(compileSpy).toHaveBeenCalledTimes(0);
  expect(Component).toEqual(compiler.getComponent('TextField'));
  expect(new Component().getClassName()).toEqual('TextField');

  // Get uncompiled component
  Component = compiler.getCompiledComponent('app.NameField');
  expect(compileSpy).toHaveBeenCalledTimes(1);
  expect(new Component().getClassName()).toEqual('app.NameField');
});

it('should get wrapped component class', () => {
  const Component = compiler._getWrappedComponentClass('TextField', {
    maxLength: 5
  });

  const component = new Component();
  expect(component.get('maxLength')).toEqual(5);
  expect(component.getClassName()).toEqual('TextField');
});

it('should compile basic component', () => {
  const Component = compiler.compile({
    component: 'TextField',
    maxLength: 5
  });

  const component = new Component();
  expect(component.get('maxLength')).toEqual(5);
  expect(component.getClassName()).toEqual('TextField');
});

it('should compile component with nested component', () => {
  const Component = compiler.compile({
    component: 'Form',
    fields: [
      {
        component: 'TextField',
        name: 'firstName',
        maxLength: 5
      }
    ]
  });

  const component = new Component();
  expect(component.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName'])
  );
  expect(component.getField('firstName').get('maxLength')).toEqual(5);
  expect(component.getClassName()).toEqual('Form');
  expect(component.getField('firstName').getClassName()).toEqual('TextField');
});

it('should get wrapped component class for uncompiled component', () => {
  registerNameField();

  const FirstName = compiler._getWrappedComponentClass('app.NameField', {
    name: 'firstName',
    maxLength: 10
  });

  const firstName = new FirstName();
  expect(firstName.get(['name', 'maxLength', 'minLength'])).toEqual({
    name: 'firstName',
    maxLength: 10,
    minLength: 5
  });

  // Uncompiled components take the name of the wrapping class
  expect(firstName.getClassName()).toEqual('app.NameField');
});

it('should compile', () => {
  registerPersonName();

  const Person = compiler.compile({
    component: 'app.Person'
  });

  expect(typeof Person).toEqual('function');

  // TODO: create and check spies
});

it('should instantiate uncompiled component', () => {
  registerPersonName();

  const person = compiler.newComponent({
    component: 'app.Person',
    fields: [
      {
        component: 'TextField',
        name: 'lastName'
      }
    ]
  });
  expect(person.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );
  expect(person.getClassName()).toEqual('app.Person');
});

it('should set class name of compiled component', () => {
  registerNameField();

  const name = compiler.newComponent({
    component: 'TextField'
  });
  expect(name.getClassName()).toEqual('TextField');
});

it('should set class name of uncompiled component', () => {
  registerNameField();

  const name = compiler.newComponent({
    component: 'app.NameField'
  });
  expect(name.getClassName()).toEqual('app.NameField');
});

it('should instantiate extended component', () => {
  registerPersonName();
  registerPersonFullName();

  const personFullName = compiler.newComponent({
    component: 'app.PersonFullName'
  });
  expect(personFullName.mapFields(field => field.get('name'))).toEqual(
    testUtils.defaultFields.concat(['firstName', 'lastName'])
  );
  expect(personFullName.getClassName()).toEqual('app.PersonFullName');
});

// TODO: needed or just expect use of composition?
// it('should instantiate nested inheritance', () => {
//   const personFullName = compiler.newComponent({
//     component: {
//       component: {
//         component: 'Form',
//         fields: [
//           {
//             component: 'TextField',
//             name: 'firstName'
//           }
//         ]
//       },
//       fields: [
//         {
//           component: 'TextField',
//           name: 'middleName'
//         }
//       ]
//     },
//     fields: [
//       {
//         component: 'TextField',
//         name: 'lastName'
//       }
//     ]
//   });
//   expect(personFullName.mapFields(field => field.get('name'))).toEqual([
//     'id',
//     'firstName',
//     'middleName',
//     'lastName'
//   ]);
//   expect(personFullName.getClassName()).toEqual('Form');
// });

it('should clone data when necessary', () => {
  const definition = {
    component: 'Form',
    isStore: true,
    fields: [
      {
        component: 'EmailField',
        name: 'email',
        label: 'Email'
      }
    ],
    listeners: [
      {
        event: 'foo',
        actions: [
          {
            component: 'Action'
          }
        ]
      }
    ]
  };

  const component1 = compiler.newComponent(definition);
  const component2 = compiler.newComponent(definition);

  component1.setValues({
    email: 'dylan@example.com'
  });
  expect(component1.getValue('email')).toEqual('dylan@example.com');
  expect(component2.getValue('email')).toBeUndefined();

  expect(component1.get('listeners')).toHaveLength(1);
  expect(component2.get('listeners')).toHaveLength(1);
});
