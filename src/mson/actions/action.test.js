import Set from './set';
import Action from './action';
import LogOutOfApp from './log-out-of-app';
import TextField from '../fields/text-field';
import compiler from '../compiler';

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
