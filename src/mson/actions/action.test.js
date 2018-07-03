import Set from './set';
import Action from './action';
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
  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
});

it('should perform multiple actions', async () => {
  const actions = createActions();
  const field = new TextField({ name: 'firstName' });
  await actions.run({
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
  expect(field.get('hidden')).toEqual(true);
});
