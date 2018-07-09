import Set from './set';
import Action from './action';
import LogOutOfApp from './log-out-of-app';
import TextField from '../fields/text-field';

const createAction = () => {
  return new Set({
    ifData: {
      foo: 'bar'
    },
    if: {
      foo: {
        $eq: 'bar'
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
  const field = new TextField({ name: 'firstName ' }); // Note: trailing space on purpose
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
  action._getSession = () => {
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
