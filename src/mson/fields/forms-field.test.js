import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';
import _ from 'lodash';
import testUtils from '../test-utils';
import utils from '../utils';
import compiler from '../compiler';

const formName = utils.uuid();

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

beforeAll(() => {
  compiler.registerComponent(formName, {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      },
      {
        name: 'lastName',
        component: 'TextField'
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent(formName);
});

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

it('should set defaults', () => {
  const field = createField();
  expect(
    field.get([
      'scrollThreshold',
      'itemsPerPage',
      'maxBufferPages',
      'spacerHeight',
      'order',
      'mode',
      'showArchived'
    ])
  ).toEqual({
    scrollThreshold: FormsField.SCROLLTHRESHOLD_DEFAULT,
    itemsPerPage: FormsField.ITEMS_PER_PAGE_DEFAULT,
    maxBufferPages: FormsField.MAX_BUFFER_PAGES_DEFAULT,
    spacerHeight: 0,
    order: null,
    mode: null,
    showArchived: null
  });
});

const shouldAddFormsQuickly = (field, milliseconds) => {
  return testUtils.expectToFinishBefore(() => {
    // Set the parent to simulate usage in the UI as adding the parent can slow the PropFiller
    field.get('form').set({ parent: field });

    for (let i = 0; i < 40; i++) {
      field.addForm({
        firstName: 'First ' + i,
        lastName: 'Last ' + i
      });
    }
  }, milliseconds);
};

const ADD_FORMS_COMPILED_TIMEOUT_MS = 300;
it('should add many forms quickly when using compiled components', () => {
  const field = createField();

  return shouldAddFormsQuickly(field, ADD_FORMS_COMPILED_TIMEOUT_MS);
});

const ADD_FORMS_UNCOMPILED_TIMEOUT_MS = 500;
it('should add many forms quickly when using uncompiled components', () => {
  const field = compiler.newComponent({
    component: 'FormsField',
    form: {
      component: formName
    }
  });

  return shouldAddFormsQuickly(field, ADD_FORMS_UNCOMPILED_TIMEOUT_MS);
});

it('should save', async () => {
  const field = createField();
  const setSpy = jest.spyOn(field, 'set');
  const saveFormSpy = jest.spyOn(field, '_saveForm');
  const form = field.get('form');

  // When there are form errors
  await field.save();
  expect(saveFormSpy).toHaveBeenCalledTimes(0);
  expect(setSpy).toHaveBeenCalledTimes(0);

  // No errors
  form.setValues({
    firstName: 'First',
    lastName: 'Last'
  });
  await field.save();
  expect(saveFormSpy).toHaveBeenCalledTimes(1);
  expect(saveFormSpy).toHaveBeenCalledWith(form);
  expect(setSpy).toHaveBeenCalledTimes(1);
  expect(setSpy).toHaveBeenCalledWith({ currentForm: form, mode: 'read' });
});
