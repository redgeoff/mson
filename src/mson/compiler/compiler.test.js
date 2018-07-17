import { Compiler } from './compiler';
import components from '../components';
import globals from '../globals';
import testUtils from '../test-utils';
import _ from 'lodash';

const newCompiler = () => {
  return new Compiler({ components });
};

const expectDefinitionToBeValid = definition => {
  const schemaForm = compiler.validateDefinition(definition);
  expect(schemaForm.getErrs()).toEqual([]);
};

let compiler = null;

beforeAll(() => {
  const compiler = newCompiler();

  compiler.registerComponent('app.Account', {
    component: 'Form',
    fields: [
      {
        component: 'TextField',
        name: 'name',
        label: 'Name',
        required: true,
        help: 'Enter a full name'
      },
      {
        component: 'EmailField',
        name: 'email',
        label: 'Email',
        required: true
      }
    ]
  });

  // Inheritance
  compiler.registerComponent('app.EditAccount', {
    component: 'app.Account',
    fields: [
      {
        component: 'ButtonField',
        name: 'save',
        label: 'Save'
      },
      {
        component: 'ButtonField',
        name: 'cancel',
        label: 'Cancel'
      }
    ]
  });

  // Dynamic inheritance
  compiler.registerComponent('app.EditThing', {
    component: '{{thing}}'
  });

  // Dynamic nested inheritance
  compiler.registerComponent('app.EditNestedThing', {
    component: 'Form',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'thing',
          component: 'Field'
        }
      ]
    },
    form: {
      component: '{{thing}}',
      fields: [
        {
          component: 'ButtonField',
          name: 'edit',
          label: 'Edit'
        }
      ]
    }
  });

  // Dynamic nested inheritance in registration
  compiler.registerComponent('app.EditNestedRegistrationThing', {
    thing: 'app.EditAccount',
    component: 'app.EditNestedThing'
  });

  // Dynamic nested inheritance where component is rendered in registration
  compiler.registerComponent('app.EditNestedRegistrationRenderedThing', {
    thing: {
      component: {
        component: {
          component: 'app.EditAccount'
        }
      }
    },
    component: 'app.EditNestedThing'
  });

  compiler.registerComponent('app.EditAccount1', {
    component: 'app.EditAccount'
  });

  compiler.registerComponent('app.EditAccount2', {
    component: 'app.EditAccount'
  });

  compiler.registerComponent('app.EditAccount3', {
    component: 'app.EditAccount',
    fields: [
      {
        component: 'TextField',
        name: 'firstName',
        label: 'First Name',
        before: 'save'
      },
      {
        component: 'TextField',
        name: 'lastName',
        label: 'Last Name',
        before: 'save'
      }
    ]
  });

  // Template parameters in listeners
  compiler.registerComponent('app.TemplatedListeners', {
    component: 'Form',
    listeners: [
      {
        event: 'create',
        actions: [
          {
            component: 'Snackbar',
            if: {
              foo: 'bar'
            },
            message: '{{foo}} this'
          }
        ]
      }
    ]
  });

  compiler.registerComponent('app.Login', {
    component: 'Form',
    fields: [
      {
        component: 'EmailField',
        name: 'username',
        label: 'Email',
        required: true,
        fullWidth: true
      },
      {
        component: 'ButtonField',
        name: 'submit',
        label: 'Log In',
        type: 'submit'
      }
    ],
    listeners: [
      {
        event: 'submit',
        actions: [
          {
            component: 'Action'
          },
          {
            component: 'Emit',
            event: 'didSubmit'
          }
        ]
      }
    ]
  });

  compiler.registerComponent('app.App', {
    component: 'App',
    menu: {
      component: 'Menu',
      items: [
        {
          content: {
            component: 'app.Login'
          }
        }
      ]
    }
  });

  compiler.registerComponent('app.CustomProps', {
    component: 'Component',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'TextField',
          required: true
        }
      ]
    }
  });
});

afterAll(() => {
  const compiler = newCompiler();
  compiler.deregisterComponent('app.EditAccount');
  compiler.deregisterComponent('app.Account');
  compiler.deregisterComponent('app.EditThing');
  compiler.deregisterComponent('app.EditNestedThing');
  compiler.deregisterComponent('app.EditNestedRegistrationThing');
  compiler.deregisterComponent('app.EditNestedRegistrationRenderedThing');
  compiler.deregisterComponent('app.EditAccount1');
  compiler.deregisterComponent('app.EditAccount2');
  compiler.deregisterComponent('app.EditAccount3');
  compiler.deregisterComponent('app.TemplatedListeners');
  compiler.deregisterComponent('app.Login');
  compiler.deregisterComponent('app.App');
  compiler.deregisterComponent('app.CustomProps');
});

beforeEach(() => {
  compiler = newCompiler();
});

it('should build & destroy', () => {
  const account = compiler.newComponent({
    component: 'app.Account'
  });
  expect(account._fields.length()).toEqual(3);
});

it('should implement inheritance', () => {
  const account = compiler.newComponent({
    component: 'app.EditAccount'
  });
  expect(account._fields.length()).toEqual(5);
});

it('should implement dynamic inheritance', () => {
  const thing1 = compiler.newComponent({
    thing: 'app.EditAccount',
    component: 'app.EditThing'
  });
  expect(thing1._fields.length()).toEqual(5);

  // We test with 2 dynamic inheritance back to back to make sure that we haven't cached any
  // previous component building.
  const thing2 = compiler.newComponent({
    thing: 'app.Account',
    component: 'app.EditThing'
  });
  expect(thing2._fields.length()).toEqual(3);
});

it('should support nested component definitions', () => {
  // TODO: check values set at topmost layer for tests below

  let thing = null;

  thing = compiler.newComponent({
    component: 'Field',
    name: 'firstName'
  });
  expect(thing.get('name')).toEqual('firstName');

  thing = compiler.newComponent({
    component: {
      component: 'Field'
    },
    name: 'firstName'
  });
  expect(thing.get('name')).toEqual('firstName');

  thing = compiler.newComponent({
    component: {
      component: {
        component: 'Field',
        name: 'firstName'
      },
      label: 'First Name'
    },
    hidden: true
  });
  expect(thing.get('name')).toEqual('firstName');
  expect(thing.get('label')).toEqual('First Name');

  thing = compiler.newComponent({
    component: {
      component: 'Form',
      fields: [
        {
          component: 'Field',
          name: 'firstName'
        }
      ]
    }
  });
  expect(thing.getField('firstName').get('name')).toEqual('firstName');

  thing = compiler.newComponent({
    component: {
      component: 'Form',
      fields: [
        {
          component: 'Field',
          name: 'firstName'
        }
      ]
    },
    baseForm: {
      component: 'Form',
      fields: [
        {
          component: 'Field',
          name: 'email'
        }
      ]
    }
  });
  expect(thing.getField('firstName').get('name')).toEqual('firstName');
  // Note: baseForm is not accessible via thing as it is not a defined property

  thing = compiler.newComponent({
    component: {
      component: {
        name: 'MyForm',
        component: {
          component: 'Form'
        },
        fields: [
          {
            component: {
              component: {
                component: 'Field'
              }
            },
            name: 'lastName'
          }
        ]
      },
      fields: [
        {
          component: {
            component: {
              component: 'Field'
            }
          },
          name: 'firstName'
        }
      ]
    },
    baseForm: {
      component: {
        name: 'myBaseForm',
        component: {
          component: 'Form'
        }
      }
    }
  });
  expect(thing.get('name')).toEqual('MyForm');
  expect(thing.mapFields(field => field.get('name'))).toEqual([
    'id',
    'lastName',
    'firstName'
  ]);
  // Note: baseForm is not accessible via thing as it is not a defined property
});

it('should implement dynamic nested inheritance', () => {
  const thing = compiler.newComponent({
    thing: 'app.EditAccount',
    component: 'app.EditNestedThing'
  });
  expect(thing._fields.length()).toEqual(6);

  // Where thing is a component and not a component name
  const thing2 = compiler.newComponent({
    thing: {
      component: 'app.EditAccount'
    },
    component: 'app.EditNestedThing'
  });
  // console.log(thing2.mapFields(field => field.get('name')));
  expect(thing2._fields.length()).toEqual(6);

  // Where thing is a component nested in a component
  const thing3 = compiler.newComponent({
    thing: {
      component: {
        component: 'app.EditAccount'
      }
    },
    component: 'app.EditNestedThing'
  });
  expect(thing3._fields.length()).toEqual(6);
});

it('should implement dynamic nested inheritance in registration', () => {
  let thing = compiler.newComponent({
    component: 'app.EditNestedRegistrationThing'
  });
  expect(thing._fields.length()).toEqual(6);

  thing = compiler.newComponent({
    component: 'app.EditNestedRegistrationRenderedThing'
  });
  expect(thing._fields.length()).toEqual(6);
});

it('should not share components', () => {
  const account1 = compiler.newComponent({
    component: 'app.EditAccount1'
  });

  const account2 = compiler.newComponent({
    component: 'app.EditAccount2'
  });

  account1.setEditable(false);
  expect(account1.getField('name').get('editable')).toEqual(false);

  // Should still be true
  expect(account2.getField('name').get('editable')).toEqual(true);
});

it('should support template parameters in listeners', async () => {
  const snackbarDisplayed = testUtils.once(globals, 'snackbarMessage');
  compiler.newComponent({
    component: 'app.TemplatedListeners',
    foo: 'bar'
  });
  await snackbarDisplayed;

  // Check snackbar message
  expect(globals.get('snackbarMessage')).toEqual('bar this');
});

it('should clone inherited component that uses before', () => {
  const account3 = compiler.newComponent({
    component: 'app.EditAccount3'
  });

  account3.clone();
});

it('nested actions should have the correct references', async () => {
  // Note: this test prevents a nasty regression where nested actions (nested in App->menu) were
  // referencing a different form instance than the one referenced by the UI.

  const app = compiler.newComponent({
    component: 'app.App'
  });

  const login = app.get('menu').get('items')[0].content;

  // Spy on action
  let username = null;
  const listeners = login.get('listeners');
  listeners[0].actions[0].act = props => {
    username = props.component.getValue('username');
  };

  login.getField('username').setValue('myusername');
  const didSubmit = testUtils.once(login, 'didSubmit');
  login.getField('submit').emitClick();
  await didSubmit;
  expect(username).toEqual('myusername');
});

it('should support custom props', () => {
  const customProps = compiler.newComponent({
    component: 'app.CustomProps',
    foo: 'bar'
  });
  expect(customProps.get('foo')).toEqual('bar');
});

const setValidateOnly = () => {
  // We need to put the compiler in to validateOnly mode so that it doesn't crash when trying to
  // instantiate dynamic components that will not be supplied.
  compiler.setValidateOnly(true);
};

it('should validate schema', () => {
  setValidateOnly();

  const def1 = {
    name: 'app.BadSchema',
    component: 'Form',
    store: true,
    fields: [
      {
        component: 'TextField',
        name: 'firstName',
        badProperty: 'foo'
      }
    ]
  };

  const schemaForm = compiler.validateDefinition(def1);

  // Make sure there were validation errors with the defintion
  expect(schemaForm.hasErr()).toEqual(true);
});

it('should validate definitions with dynamic components', () => {
  setValidateOnly();

  expectDefinitionToBeValid({
    name: 'app.ChangePassword',
    component: 'UpdatePasswordEditor',
    updatePasswordBaseForm: 'User',
    storeName: 'User'
  });

  expectDefinitionToBeValid({
    name: 'app.EditThingInstance',
    component: 'app.EditThing'
  });

  expectDefinitionToBeValid({
    name: 'app.EmployeeSignup',
    component: 'SignupEditor',
    signupBaseForm: 'User',
    storeName: 'User'
  });

  expectDefinitionToBeValid({
    name: 'app.Employees',
    component: 'Form',
    fields: [
      {
        name: 'employees',
        label: 'Employees',
        component: 'UserList',
        baseForm: 'User',
        storeName: 'User'
      }
    ]
  });
});

it('should support schema props at the same layer', () => {
  expectDefinitionToBeValid({
    name: 'app.SameLayer',
    component: 'Component',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'Field'
        }
      ]
    },
    foo: 'bar'
  });
});

it('should validate the definitions of all core components', () => {
  setValidateOnly();

  _.each(components, component => {
    if (!compiler.isCompiled(component)) {
      expectDefinitionToBeValid(component);
    }
  });
});
