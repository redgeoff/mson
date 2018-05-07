import User from './user';
import TextField from '../fields/text-field';

// Note: this is needed so that MSONComponent has a reference to the compiler
import '../compiler';

it('should sanity check', () => {
  const user = new User({
    fields: [
      new TextField({
        name: 'name',
        label: 'Name',
        required: true
      })
    ]
  });

  const values = {
    username: 'username',
    password: 'secret123',
    name: 'Full Name'
  };

  user.setValues(values);

  expect(user.getValues()).toEqual({
    id: null,
    ...values
  });
});
