import Set from './set';
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

it('should act', async () => {
  const action = createAction();
  const field = new TextField({ name: 'firstName ' });
  await action.run({
    component: field
  });
  expect(field.getValue()).toEqual('Jack');
});
