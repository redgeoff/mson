import Set from './set';
import Action from './action';
import LogOutOfApp from './log-out-of-app';
import TextField from '../fields/text-field';
import compiler from '../compiler';
import Form from '../form';

const createAction = () => {
  return new Set({
    if: {
      label: {
        $eq: 'First Name'
      }
    },
    name: 'value',
    value: 'Jack'
  });
};

const createActions = () => {
  return new Action({
    actions: [
      new Set({
        name: 'value',
        value: 'Jack'
      }),
      new Set({
        name: 'hidden',
        value: true
      })
    ]
  });
};

it('should act', async () => {
  const action = createAction();
  const field = new TextField({ name: 'firstName ', label: 'First Name' }); // Note: trailing space on purpose
  const args = await action.run({
    arguments: 'foo',
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
  expect(args).toEqual('foo');
});

it('should perform multiple actions', async () => {
  const actions = createActions();
  const field = new TextField({ name: 'firstName' });
  const args = await actions.run({
    arguments: 'foo',
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
  expect(field.get('hidden')).toEqual(true);
  expect(args).toEqual('foo');
});

it('should handle undefined props', async () => {
  // Make sure can handle props being undefined as can occur if menuItem component is an Action

  const logOutOfApp = new LogOutOfApp();

  // Mock client
  logOutOfApp._logOutOfApp = () => {};

  let action = logOutOfApp;
  await action.run();

  action = new Action({
    actions: [logOutOfApp]
  });
  await action.run();
});

it('should filter by globals', async () => {
  const action = new Set({
    if: {
      globals: {
        session: {
          user: {
            roleNames: {
              $in: ['admin']
            }
          }
        }
      }
    },
    name: 'value',
    value: 'Jack'
  });

  // Mock
  action._componentFillerProps._getSession = () => {
    return {
      user: {
        roleNames: ['admin']
      }
    };
  };

  const field = new TextField({ name: 'firstName' });

  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
});

it('should perform two-stage filling', async () => {
  const form = compiler.newComponent({
    component: 'Form',
    body: '{{fields.body.value}}',
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'body',
          component: 'TextField'
        }
      ]
    },
    fields: [
      {
        name: 'body',
        component: 'TextField'
      },
      {
        name: 'foo',
        component: 'TextField'
      }
    ]
  });
  form.setValues({
    body: 'body from field'
  });

  const set = new Set({
    name: 'fields.foo.value',
    value: '{{body}}'
  });

  // Value is set by default, e.g. {{fields.body.value}}
  await set.run({
    component: form
  });
  expect(form.getValue('foo')).toEqual('body from field');

  // Value is set by property
  form.set({ body: 'body from override' });
  await set.run({
    component: form
  });
  expect(form.getValue('foo')).toEqual('body from override');
});

it('should filter by arguments', async () => {
  const action = new Set({
    if: {
      arguments: {
        $ne: null
      }
    },
    name: 'value',
    value: 'Jack'
  });

  const field = new TextField({ name: 'firstName' });

  await action.run({
    component: field,
    arguments: null
  });
  expect(field.getValue()).toBeUndefined();

  await action.run({
    component: field,
    arguments: {}
  });
  expect(field.getValue()).toEqual('Jack');
});

class SetNameAction extends Action {
  _className = 'SetNameAction';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'thing',
            component: 'Field'
          },
          {
            name: 'value',
            component: 'TextField'
          }
        ]
      }
    });
  }

  async act(/* props */) {
    this.get('thing').setValue(this.get('value'));
  }
}

it('should share components', async () => {
  const name = new TextField();

  const action = new SetNameAction({ thing: name, value: 'bar' });

  await action.run();

  expect(name.getValue()).toEqual('bar');
});

it('should fill with any field property', async () => {
  const form = new Form({
    fields: [new TextField({ name: 'firstName', useDisplayValue: false })]
  });

  const action = new Set({
    name: 'fields.firstName.value',
    value: '{{fields.firstName.useDisplayValue}}'
  });

  await action.run({ component: form });
  expect(form.getValue('firstName')).toEqual(false);
});

it('should branch', async () => {
  const field = new TextField();

  // An action with actions and an else block
  const action = new Action({
    if: {
      value: 'Nina'
    },
    actions: [
      new Set({
        name: 'value',
        value: 'Ella'
      })
    ],
    else: [
      new Set({
        name: 'value',
        value: 'Nina'
      })
    ]
  });

  await action.run({ component: field });
  expect(field.getValue()).toEqual('Nina');

  await action.run({ component: field });
  expect(field.getValue()).toEqual('Ella');

  // When the action doesn't have nested actions
  const set = new Set({
    if: {
      value: 'Nina'
    },
    name: 'value',
    value: 'Ella'
  });

  field.setValue('Billie');
  await set.run({ component: field });
  expect(field.getValue()).toEqual('Billie');

  field.setValue('Nina');
  await set.run({ component: field });
  expect(field.getValue()).toEqual('Ella');
});

it('should filter by nested properties', async () => {
  const action = new Set({
    if: {
      parent: {
        parent: {
          name: 'grandparent'
        }
      }
    },
    name: 'value',
    value: 'Jack'
  });

  const field = new TextField({
    name: 'firstName',
    parent: new TextField({
      name: 'parent',
      parent: new TextField({ name: 'granddad' })
    })
  });

  await action.run({
    component: field
  });
  expect(field.getValue()).toBeUndefined();

  field.set({ 'parent.parent.name': 'grandparent' });

  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
});

it('should get nested property', async () => {
  const action = new Set({
    name: 'value',
    value: '{{parent.parent.name}}'
  });

  const field = new TextField({
    name: 'firstName',
    parent: new TextField({
      name: 'parent',
      parent: new TextField({ name: 'grandparent' })
    })
  });

  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('grandparent');
});

it('should retrieve parent properties', async () => {
  const field = new TextField();

  const action = new Set({
    schema: {
      component: 'Form',
      fields: [
        {
          name: 'foo',
          component: 'Field'
        }
      ]
    },
    actions: [
      new Set({
        name: 'value',
        value: '{{action.foo}}'
      })
    ]
  });

  action.set({ foo: 'bar' });

  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('bar');
});
