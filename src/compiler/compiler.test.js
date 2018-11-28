import { Compiler } from './compiler';
import components from '../components';
import optionalComponents from '../optional-components';
import globals from '../globals';
import testUtils from '../test-utils';
import each from 'lodash/each';
import Action from '../actions/action';
import Form from '../form';

const newCompiler = () => {
  const compiler = new Compiler({ components: Object.assign({}, components) });
  compiler.registerComponents(optionalComponents);
  return compiler;
};

const expectDefinitionToBeValid = (definition, name, ignoreRequired) => {
  if (!name) {
    name = definition.name;
  }

  const schemaForm = compiler.createSchemaForm(definition);

  if (ignoreRequired) {
    // Ignore the required fields. Useful for when we are sanity checking the validation of a
    // definition and don't have actual property values
    schemaForm.set({ required: false });
  }

  schemaForm.setValues(definition);
  schemaForm.validate();

  expect([name, schemaForm.getErrs()]).toEqual([name, []]);
};

let compiler = null;

const registerComponents = () => {
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

  // Composition
  compiler.registerComponent('app.EditThing', {
    component: 'WrappedComponent'
  });

  // Dynamic composition
  compiler.registerComponent('app.EditNestedThing', {
    component: 'Form',
    fields: [
      {
        component: 'ButtonField',
        name: 'edit',
        label: 'Edit'
      }
    ]
  });

  // Dynamic composition in registration
  compiler.registerComponent('app.EditNestedRegistrationThing', {
    component: 'app.EditNestedThing',
    componentToWrap: {
      component: 'app.EditAccount'
    }
  });

  // Note: no longer supported
  // // Dynamic nested composition where component is compiled in registration
  // compiler.registerComponent('app.EditNestedRegistrationRenderedThing', {
  //   component: 'app.EditNestedThing',
  //   componentToWrap: {
  //     component: {
  //       component: {
  //         component: 'app.EditAccount'
  //       }
  //     }
  //   }
  // });

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
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'TextField'
        }
      ]
    },
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
};

const deregisterComponents = () => {
  compiler.deregisterComponent('app.EditAccount');
  compiler.deregisterComponent('app.Account');
  compiler.deregisterComponent('app.EditThing');
  compiler.deregisterComponent('app.EditNestedThing');
  compiler.deregisterComponent('app.EditNestedRegistrationThing');
  // compiler.deregisterComponent('app.EditNestedRegistrationRenderedThing');
  compiler.deregisterComponent('app.EditAccount1');
  compiler.deregisterComponent('app.EditAccount2');
  compiler.deregisterComponent('app.EditAccount3');
  compiler.deregisterComponent('app.TemplatedListeners');
  compiler.deregisterComponent('app.Login');
  compiler.deregisterComponent('app.App');
  compiler.deregisterComponent('app.CustomProps');
};

beforeEach(() => {
  compiler = newCompiler();
  registerComponents();
});

afterEach(() => {
  deregisterComponents();
});

it('should build & destroy', () => {
  const account = compiler.newComponent({
    component: 'app.Account'
  });
  expect(account.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 2
  );
});

it('should implement inheritance', () => {
  const account = compiler.newComponent({
    component: 'app.EditAccount'
  });
  expect(account.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 4
  );
});

it('should implement composition', () => {
  const thing1 = compiler.newComponent({
    component: 'app.EditThing',
    componentToWrap: {
      component: 'app.EditAccount'
    }
  });
  expect(thing1.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 4
  );

  // We test with 2 dynamic inheritance back to back to make sure that we haven't cached any
  // previous component building.
  const thing2 = compiler.newComponent({
    component: 'app.EditThing',
    componentToWrap: {
      component: 'app.Account'
    }
  });
  expect(thing2.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 2
  );
});

// TODO: is this really needed or expect use of composition?
// it('should support nested component definitions', () => {
//   // TODO: check values set at topmost layer for tests below
//
//   let thing = null;
//
//   thing = compiler.newComponent({
//     component: 'Field',
//     name: 'firstName'
//   });
//   expect(thing.get('name')).toEqual('firstName');
//
//   thing = compiler.newComponent({
//     component: {
//       component: 'Field'
//     },
//     name: 'firstName'
//   });
//   expect(thing.get('name')).toEqual('firstName');
//
//   thing = compiler.newComponent({
//     component: {
//       component: {
//         component: 'Field',
//         name: 'firstName'
//       },
//       label: 'First Name'
//     },
//     hidden: true
//   });
//   expect(thing.get('name')).toEqual('firstName');
//   expect(thing.get('label')).toEqual('First Name');
//
//   thing = compiler.newComponent({
//     component: {
//       component: 'Form',
//       fields: [
//         {
//           component: 'Field',
//           name: 'firstName'
//         }
//       ]
//     }
//   });
//   expect(thing.getField('firstName').get('name')).toEqual('firstName');
//
//   thing = compiler.newComponent({
//     component: {
//       component: 'Form',
//       fields: [
//         {
//           component: 'Field',
//           name: 'firstName'
//         }
//       ]
//     },
//     baseForm: {
//       component: 'Form',
//       fields: [
//         {
//           component: 'Field',
//           name: 'email'
//         }
//       ]
//     }
//   });
//   expect(thing.getField('firstName').get('name')).toEqual('firstName');
//   // Note: baseForm is not accessible via thing as it is not a defined property
//
//   thing = compiler.newComponent({
//     component: {
//       component: {
//         name: 'MyForm',
//         component: {
//           component: 'Form'
//         },
//         fields: [
//           {
//             component: {
//               component: {
//                 component: 'Field'
//               }
//             },
//             name: 'lastName'
//           }
//         ]
//       },
//       fields: [
//         {
//           component: {
//             component: {
//               component: 'Field'
//             }
//           },
//           name: 'firstName'
//         }
//       ]
//     },
//     baseForm: {
//       component: {
//         name: 'myBaseForm',
//         component: {
//           component: 'Form'
//         }
//       }
//     }
//   });
//   expect(thing.get('name')).toEqual('MyForm');
//   expect(thing.mapFields(field => field.get('name'))).toEqual([
//     'id',
//     'lastName',
//     'firstName'
//   ]);
//   // Note: baseForm is not accessible via thing as it is not a defined property
// });

it('should implement dynamic composition', () => {
  const thing = compiler.newComponent({
    component: 'app.EditNestedThing',
    componentToWrap: {
      component: 'app.EditAccount'
    }
  });
  expect(thing.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 5
  );

  // Note: no longer supported
  // // Where thing is a component nested in a component
  // const thing2 = compiler.newComponent({
  //   component: 'app.EditNestedThing',
  //   componentToWrap: {
  //     component: {
  //       component: 'app.EditAccount'
  //     }
  //   }
  // });
  // expect(thing2.get('fields').length()).toEqual(6);
});

it('should implement dynamic nested inheritance in registration', () => {
  let thing = compiler.newComponent({
    component: 'app.EditNestedRegistrationThing'
  });
  expect(thing.get('fields').length()).toEqual(
    testUtils.defaultFields.length + 5
  );

  // Note: no longer supported
  // thing = compiler.newComponent({
  //   component: 'app.EditNestedRegistrationRenderedThing'
  // });
  // expect(thing.get('fields').length()).toEqual(6);
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
    isStore: true,
    fields: [
      {
        component: 'TextField',
        name: 'firstName',
        badProperty: 'foo'
      }
    ],

    // Note: nested fields like this are ignored
    'fields.foo.value': 'bar'
  };

  const schemaForm = compiler.validateDefinition(def1);

  // Make sure there were validation errors with the defintion
  expect(schemaForm.hasErr()).toEqual(true);
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

const validateComponents = components => {
  each(components, (component, name) => {
    if (!compiler.isCompiled(component)) {
      expectDefinitionToBeValid(component, name, true);
    }
  });
};

it('should validate the definitions of all core components', () => {
  setValidateOnly();
  validateComponents(components);
  validateComponents(optionalComponents);
});

it('should define className for all core components', () => {
  setValidateOnly();

  each(components, (component, name) => {
    const c = compiler.newComponent({
      component: name
    });

    expect(c._className).toEqual(name);
  });
});

const changePassword = {
  name: 'app.ChangePassword',
  component: 'UpdatePasswordEditor',
  updatePasswordBaseForm: {
    component: 'User'
  },
  store: {
    component: 'MemoryStore'
  }
};

const editThingInstance = {
  name: 'app.EditThingInstance',
  component: 'app.EditThing'
};

const employeeSignup = {
  name: 'app.EmployeeSignup',
  component: 'SignupEditor',
  baseForm: {
    component: 'User',
    fields: [
      {
        component: 'Field',
        name: 'roles'
      }
    ]
  },
  store: {
    component: 'MemoryStore'
  }
};

const employees = {
  name: 'app.Employees',
  component: 'Form',
  fields: [
    {
      name: 'employees',
      label: 'Employees',
      component: 'UserList',
      baseFormFactory: {
        component: 'Factory',
        product: {
          component: 'User'
        }
      },
      store: {
        component: 'MemoryStore'
      }
    }
  ]
};

const accountWithDefaultName = {
  name: 'app.AccountWithDefaultName',
  component: 'app.Account',
  'fields.name.value': 'David Bowie'
};

it('should validate definitions with dynamic components', () => {
  setValidateOnly();

  expectDefinitionToBeValid(changePassword);

  expectDefinitionToBeValid(editThingInstance);

  expectDefinitionToBeValid(employeeSignup);

  expectDefinitionToBeValid(employees);

  expectDefinitionToBeValid(accountWithDefaultName);
});

const newComponentAndResolveAfterCreate = async definition => {
  const component = compiler.newComponent(definition);
  await component.resolveAfterCreate();
};

it('should instantiate definitions with dynamic components', async () => {
  await newComponentAndResolveAfterCreate(changePassword);

  await newComponentAndResolveAfterCreate(editThingInstance);

  await newComponentAndResolveAfterCreate(employeeSignup);

  await newComponentAndResolveAfterCreate(employees);
});

it('get component should throw if component missing', () => {
  expect(() => compiler.getComponent('AMissingComponent')).toThrow();
});

it('should allow reregistration', () => {
  const form = new Form();
  compiler.registerComponent('app.Account', form);
  expect(compiler.getComponent('app.Account')).toEqual(form);
});

it('should get oldest compiled ancestor', () => {
  expect(compiler.getOldestCompiledAncestor('TextField')).toEqual('TextField');
  expect(compiler.getOldestCompiledAncestor('EmailField')).toEqual(
    'TextFieldHiddenSchema'
  );
});

class FooIt extends Action {
  _className = 'FooIt';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'theStore',
            component: 'Field'
          },
          {
            name: 'expected',
            component: 'Field'
          },
          {
            name: 'value',
            component: 'Field'
          }
        ]
      }
    });
  }

  async act(/* props */) {
    const theStore = this.get('theStore');
    expect(theStore.get('foo')).toEqual(this.get('expected'));
    theStore.set({ foo: this.get('value') });
  }
}

it('should share template parameters', async () => {
  compiler.registerComponent('app.FooIt', FooIt);

  compiler.registerComponent('app.SharedTemplateParameters', {
    component: 'Component',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'store',
          component: 'Field'
        }
      ]
    },
    listeners: [
      {
        event: 'foo',
        actions: [
          {
            component: 'app.FooIt',
            theStore: '{{store}}',
            expected: 'bar',
            value: 'baz'
          },
          {
            component: 'app.FooIt',
            theStore: '{{store}}',
            expected: 'baz',
            value: 'naz'
          }
        ]
      }
    ]
  });

  const component = compiler.newComponent({
    component: 'app.SharedTemplateParameters',
    store: {
      component: 'app.CustomProps',
      foo: 'bar'
    }
  });

  await component.runListeners('foo');
});
