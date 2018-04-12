import FormField from './form-field';
import Form from '../form';
import TextField from './text-field';

const createField = () => {
  return new FormField({
    name: 'fullName',
    label: 'Full Name',
    form: new Form({
      fields: [
        new TextField({
          name: 'firstName',
          label: 'First Name'
        }),
        new TextField({
          name: 'lastName',
          label: 'Last Name'
        })
      ]
    })
  });
};

it('should set and pass through properties', async () => {
  const field = createField();
  const properties = ['disabled'];

  properties.forEach(prop => {
    field.set({ [prop]: true });
  });
});
