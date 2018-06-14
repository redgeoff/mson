import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';

const createForm = () => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ]
  });
};

const createField = () => {
  return new FormsField({
    form: createForm()
  });
};

it('should infinite scroll', async () => {
  const field = createField();

  // Load initial page

  // Load next page and reset buffer

  // Load previous page and reset buffer
});
