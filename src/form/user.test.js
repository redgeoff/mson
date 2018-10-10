import User from './user';
import TextField from '../fields/text-field';
import compiler from '../compiler';
import Form from '../form';

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

  expect(user.getValues({ out: true })).toEqual({
    username: 'username',
    id: undefined,
    name: 'Full Name'
  });

  expect(user.getValues()).toEqual({
    id: undefined,
    ...values
  });
});

it('should validate schema', () => {
  const user = new User();

  const schemaForm = new Form();
  user.buildSchemaForm(schemaForm, compiler);

  schemaForm.setValues({
    name: 'myUser',
    roles: ['owner']
  });
  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);
  expect(schemaForm.getErrs()).toEqual([
    {
      field: 'roles',
      error: [
        {
          field: 0,
          error: 'invalid'
        }
      ]
    }
  ]);
});
