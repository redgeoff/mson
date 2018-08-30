import Form from './form';
import TextField from '../fields/text-field';
import testUtils from '../test-utils';
import compiler from '../compiler';

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
    id: undefined,
    firstName: 'Ray',
    middleName: undefined,
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
    id: undefined,
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
    id: undefined,
    firstName: 'Ray',
    middleName: 'Charles',
    lastName: 'Robinson'
  });

  expect(form.getValues()).toEqual({
    id: undefined,
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
    id: undefined,
    firstName: 'Ray',
    middleName: null,
    lastName: 'Charles',
    suffix: undefined
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
  form.buildSchemaForm(schemaForm, compiler);

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
        where: {
          fields: {
            name: {
              value: 'F. Scott Fitzgerald'
            }
          }
        },
        error: {
          field: 'name',
          error: 'cannot be {{fields.firstName.value}}'
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
          error: 'cannot be {{fields.firstName.value}}'
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
          id: undefined,
          error: [
            {
              field: 'badProperty',
              error: 'undefined field'
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
          error: [{ error: 'required', field: 'where' }]
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

it('should auto validate', () => {
  const form = createForm();
  const spy = jest.spyOn(form, 'validate');

  // Auto validate should be off by default as it incurs a lot of extra overhead
  form.setValues({
    firstName: 'Ella'
  });
  form.getField('lastName').setValue('Fitzgerald');
  expect(spy).toHaveBeenCalledTimes(0);
  expect(form.hasErr()).toEqual(false);

  // Turn on autoValidate, e.g. as would be done in the UI
  form.set({ autoValidate: true });
  form.getField('lastName').setValue('Fitz');
  expect(spy).toHaveBeenCalledTimes(1);
  expect(form.getErrs()).toEqual([
    {
      field: 'middleName',
      error: 'required'
    }
  ]);
});

it('should remove blank fields', () => {
  const name = {
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  };

  const form = createForm();

  form.setValues(name);

  form.removeBlankFields();

  expect(form.getValues()).toEqual(name);

  form.getField('middleName').clearValue();
  form.getField('lastName').clearValue();

  expect(form.getValues()).toEqual({
    firstName: 'First',
    middleName: null,
    lastName: null
  });

  expect(form.getValues({ blank: false })).toEqual({
    firstName: 'First'
  });

  form.removeBlankFields();

  expect(form.getValues()).toEqual({
    firstName: 'First'
  });
});

it('should merge access', () => {
  const form = createForm();

  const access1 = {
    form: {
      read: ['admin', 'employee'],
      update: 'employee'
    },
    fields: {
      firstName: {
        create: 'admin'
      },
      middleName: {
        update: 'employee'
      }
    }
  };

  form.set({ access: access1 });
  expect(form.get('access')).toEqual(access1);

  // Should merge with existing
  form.set({
    access: {
      form: {
        create: ['admin'],
        update: ['admin', 'employee']
      },
      fields: {
        firstName: {
          update: 'admin'
        },
        lastName: {
          create: 'admin'
        }
      }
    }
  });

  expect(form.get('access')).toEqual({
    form: {
      create: ['admin'],
      read: ['admin', 'employee'],
      update: ['admin', 'employee']
    },
    fields: {
      firstName: {
        create: 'admin',
        update: 'admin'
      },
      middleName: {
        update: 'employee'
      },
      lastName: {
        create: 'admin'
      }
    }
  });
});

it('should handle load', () => {
  const form = new Form({ resetOnLoad: false });

  const resetSpy = jest.spyOn(form, 'reset');

  form._handleLoadFactory()();
  expect(resetSpy).toHaveBeenCalledTimes(0);

  form.set({ resetOnLoad: true });
  form._handleLoadFactory()();
  expect(resetSpy).toHaveBeenCalledTimes(1);
});

it('should handle showArchived', () => {
  const form = new Form();

  expect(form._fields.first().get('showArchived')).toBeUndefined();
  form._handleShowArchivedFactory()(true);
  expect(form._fields.first().get('showArchived')).toEqual(true);
});

it('should handle searchString', () => {
  const form = new Form();

  expect(form._fields.first().get('searchString')).toBeUndefined();
  form._handleSearchStringFactory()('foo');
  expect(form._fields.first().get('searchString')).toEqual('foo');
});

it('should handle scroll', () => {
  const form = createForm();

  const e = {};

  const spies = [];
  form.eachField(field => spies.push(jest.spyOn(field, 'emit')));

  form._handleScrollFactory()(e);
  spies.forEach(spy => expect(spy).toHaveBeenCalledWith('scroll', e));
});
