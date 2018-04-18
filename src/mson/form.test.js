import Form from './form';
import TextField from './fields/text-field';
import testUtils from './test-utils';
import builder from './builder';

const createForm = () => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({
        name: 'middleName',
        label: 'Middle Name',
        required: true
      }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ]
  });
};

it('should set, get and clear', () => {
  const form = createForm();

  form.clearValues();
  expect(form.getValues()).toEqual({
    id: null,
    firstName: null,
    middleName: null,
    lastName: null
  });

  form.setValues({
    id: 1,
    firstName: 'Ray',
    lastName: 'Charles'
  });
  expect(form.getValues()).toEqual({
    id: 1,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles'
  });

  form.setValues({
    middleName: 'Charles',
    lastName: 'Robinson'
  });
  expect(form.getValues()).toEqual({
    id: 1,
    firstName: 'Ray',
    middleName: 'Charles',
    lastName: 'Robinson'
  });

  form.clearValues();
  expect(form.getValues()).toEqual({
    id: null,
    firstName: null,
    middleName: null,
    lastName: null
  });
});

it('should get null when only set some', () => {
  const form = createForm();

  form.setValues({
    firstName: 'Ray',
    lastName: 'Charles'
  });
  expect(form.getValues()).toEqual({
    id: null,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles'
  });
});

it('should clone', () => {
  const form = createForm();

  form.setValues({
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles'
  });

  const clonedForm = form.clone();

  expect(clonedForm.getValues()).toEqual({
    id: null,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles'
  });

  clonedForm.setValues({
    firstName: 'Ray',
    middleName: 'Charles',
    lastName: 'Robinson'
  });

  expect(clonedForm.getValues()).toEqual({
    id: null,
    firstName: 'Ray',
    middleName: 'Charles',
    lastName: 'Robinson'
  });

  expect(form.getValues()).toEqual({
    id: null,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles'
  });

  form.validate();
  expect(form.getField('middleName').getErr()).toBeTruthy();

  clonedForm.validate();
  expect(clonedForm.getField('middleName').getErr()).toBeNull();

  form.addField(
    new TextField({ name: 'suffix', label: 'Suffix', required: true })
  );
  expect(form._fields.length()).toEqual(5);
  expect(clonedForm._fields.length()).toEqual(4);

  clonedForm.clearValues();
  expect(form.getValues()).toEqual({
    id: null,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles',
    suffix: null
  });
});

it('should clone listeners', async () => {
  // Make sure listeners cloned, but separate
  const form = createForm();
  const clonedForm = form.clone();
  const receivedValues = testUtils.once(clonedForm, 'values');
  let receivedNonClonedValues = false;
  form.once('values', () => {
    receivedNonClonedValues = true;
  });
  clonedForm.setValues({
    firstName: 'Raymond'
  });
  await receivedValues;
  expect(receivedNonClonedValues).toEqual(false);
});

it('should remove fields', async () => {
  const form = createForm();
  form.setValues({
    id: null,
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  });
  form.removeField('middleName');
  expect(form.getValues()).toEqual({
    id: null,
    firstName: 'First',
    lastName: 'Last'
  });

  form.removeFieldsExcept(['firstName']);
  expect(form.getValues()).toEqual({
    firstName: 'First'
  });
});

it('should report bad types', () => {
  const form = createForm();

  const validValues = [
    {
      firstName: 'Stevie',
      middleName: 'Hardaway',
      lastName: 'Wonder'
    },
    {},
    null
  ];

  validValues.forEach(value => {
    form.setValues(value);
    form.validate();
    expect(form.hasErr()).toEqual(false);
  });

  const invalidValues = [
    ['must not be array'],
    false,
    1,
    1.0,
    'must not be string'
  ];

  invalidValues.forEach(value => {
    form.setValues(value);
    form.validate();
    expect(form.hasErr()).toEqual(true);
    expect(form.getErrs()).toEqual([{ error: 'must be an object' }]);
  });
});

it('should report extra fields', () => {
  const form = createForm();

  form.setValues({
    prefix: 'Mr',
    firstName: 'Stevie',
    middleName: 'Hardaway',
    lastName: 'Wonder',
    suffix: 'Maestro'
  });
  form.validate();
  expect(form.hasErr()).toEqual(true);
  expect(form.getErrs()).toEqual([
    { field: 'prefix', error: 'undefined field' },
    { field: 'suffix', error: 'undefined field' }
  ]);
});

it('should validate schema', () => {
  const form = new Form();
  const schemaForm = new Form();
  form.buildSchemaForm(schemaForm, builder);

  schemaForm.setValues({
    name: 'org.proj.Form',
    component: 'Form',
    fields: [
      {
        component: 'TextField',
        name: 'name',
        label: 'Name',
        required: true,
        help: 'Enter a full name'
      },
      {
        component: 'EmailField',
        name: 'email',
        label: 'Email',
        required: true
      }
    ],
    access: {
      form: {
        create: 'role1'
      },
      fields: {
        email: {
          create: 'role2'
        }
      }
    },
    validators: [
      {
        selector: {
          name: {
            value: 'F. Scott Fitzgerald'
          }
        },
        error: {
          field: 'name',
          error: 'cannot be {{firstName.value}}'
        }
      }
    ]
    // TODO: listeners
  });

  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(false);

  schemaForm.setValues({
    fields: [
      {
        component: 'TextField',
        badProperty: 'name'
      }
    ],
    access: {
      fields: {
        email: {
          create: 'role2'
        }
      }
    },
    validators: [
      {
        error: {
          field: 'name',
          error: 'cannot be {{firstName.value}}'
        }
      }
    ]
  });

  schemaForm.validate();
  expect(schemaForm.hasErr()).toEqual(true);
  expect(schemaForm.getErrs()).toEqual([
    {
      field: 'fields',
      error: [
        {
          id: null,
          error: [
            {
              field: 'badProperty',
              error: 'undefined field'
            },
            {
              field: 'name',
              error: 'required'
            }
          ]
        }
      ]
    },
    {
      field: 'validators',
      error: [
        {
          id: null,
          error: [{ error: 'required', field: 'selector' }]
        }
      ]
    },
    {
      field: 'access',
      error: [
        {
          field: 'fields',
          error: [
            {
              field: 'email',
              error: 'undefined field'
            }
          ]
        }
      ]
    }
  ]);
});
