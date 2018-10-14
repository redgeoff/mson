import Form from './form';
import { TextField } from '../fields';
import FormErr from './form-err';

it('should create message', () => {
  const form = new Form({
    fields: [
      new TextField({ name: 'firstName', required: true }),
      new TextField({ name: 'lastName', required: true })
    ]
  });
  form.validate();

  const err = new FormErr({ form });
  expect(err.message).toEqual(
    JSON.stringify({
      message: 'invalid input',
      error: [
        {
          field: 'firstName',
          error: 'required'
        },
        {
          field: 'lastName',
          error: 'required'
        }
      ]
    })
  );
});
