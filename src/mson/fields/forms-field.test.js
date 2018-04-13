import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';
import _ from 'lodash';

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

const fillDocs = field => {
  field.addForm({ id: 1, firstName: 'Ella', lastName: 'Fitzgerald' });
  field.addForm({ id: 2, firstName: 'Frank', lastName: 'Sinatra' });
};

it('should get forms', async () => {
  const field = createField();

  fillDocs(field);

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

it('should set and get value', async () => {
  const field = createField();

  const value = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Legend'
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Lennon'
    }
  ];

  field.setValue(value);
  expect(field.getValue()).toEqual(value);
});

it('should clear errors for nested forms', () => {
  const field = createField();
  field.setValue([
    {
      firstName: null,
      lastName: null
    },
    {
      firstName: null,
      lastName: null
    }
  ]);
  field.validate();
  expect(field.hasErr()).toBe(true);

  field.clearErr();
  expect(field.hasErr()).toBe(false);
});

it('should set properties for nested forms', () => {
  const properties = {
    dirty: true,
    disabled: true,
    editable: true,
    touched: true,
    pristine: true
  };

  const field = createField();
  const setSpy = jest.spyOn(field, '_setForAllForms');

  _.each(properties, (value, prop) => {
    const props = { [prop]: value };
    field.set(props);

    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith(props);

    setSpy.mockClear();
  });
});

// TODO: should get properties for nested forms

// TODO: should bubble up events
