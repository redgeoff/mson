import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';
import _ from 'lodash';
import testUtils from '../test-utils';
import utils from '../utils';

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
    dirty: false,
    disabled: true,
    editable: true,
    touched: false,
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

it('should bubble up properties', async () => {
  const properties = {
    dirty: true,
    touched: true
  };

  const field = createField();

  fillDocs(field);

  const setSpy = jest.spyOn(field, 'set');

  await utils.sequential(properties, async (value, prop) => {
    // Initialize at field layer which cascades down to form and then fields
    field.set({ [prop]: !value });

    const firstName = field.getForm(1).getField('firstName');

    // Initialize
    firstName.set({ [prop]: !value });

    const afterEvent = testUtils.once(firstName, prop);

    const props = { [prop]: value };
    firstName.set(props);

    await afterEvent;

    // Called twice first time for initialization
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(setSpy).toHaveBeenCalledWith(props);

    setSpy.mockClear();
  });
});

it('should report bad types', () => {
  const field = createField();

  testUtils.expectValuesToBeValid(field, [
    [
      {
        firstName: 'Stevie',
        lastName: 'Wonder'
      }
    ],
    [],
    null
  ]);

  testUtils.expectValuesToBeInvalid(
    field,
    [
      {
        foo: 'must not be object'
      },
      ['must not be array'],
      false,
      1,
      1.0,
      'must not be string'
    ],
    [{ error: 'must be an array of objects' }]
  );
});

it('should clear props on unload', () => {
  const field = createField();
  const setSpy = jest.spyOn(field, 'set');
  field._onUnload();
  expect(setSpy).toHaveBeenCalledWith({
    order: null,
    mode: null,
    showArchived: null
  });
});
