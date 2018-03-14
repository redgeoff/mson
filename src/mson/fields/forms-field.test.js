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

const fillDocs = async field => {
  await field
    .getStore()
    .set({ id: 1, firstName: 'Ella', lastName: 'Fitzgerald' });
  await field
    .getStore()
    .set({ id: 2, firstName: 'Frank', lastName: 'Sinatra' });
};

it('should get forms', async () => {
  const field = createField();

  await fillDocs(field);

  let forms = [];
  for (const form of field.getForms()) {
    forms.push(form);
  }

  expect(forms[0].getValues()).toEqual({
    id: 1,
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  });
  expect(forms[1].getValues()).toEqual({
    id: 2,
    firstName: 'Frank',
    lastName: 'Sinatra'
  });
});
