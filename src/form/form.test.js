import Form from './form';
import ButtonField from '../fields/button-field';
import TextField from '../fields/text-field';
import testUtils from '../test-utils';
import compiler from '../compiler';
import FormField from '../fields/form-field';
import Set from '../actions/set';
import Text from '../text';
import FormErr from './form-err';
import ExtendedField from '../fields/extended-field';

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({
        name: 'middleName',
        label: 'Middle Name',
        required: true
      }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ],
    ...props
  });
};

it('should set, get and clear', () => {
  const form = createForm();

  const defaults = testUtils.toDefaultFieldsObject(null);

  form.clearValues();
  expect(form.getValues()).toEqual({
    ...defaults,
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
    ...defaults,
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
    ...defaults,
    id: 1,
    firstName: 'Ray',
    middleName: 'Charles',
    lastName: 'Robinson'
  });

  form.setValues(null);
  expect(form.getValues()).toEqual({
    ...defaults,
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
  expect(form._fields.length()).toEqual(testUtils.defaultFields.length + 4);
  expect(clonedForm._fields.length()).toEqual(
    testUtils.defaultFields.length + 3
  );

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
  const receivedValues = testUtils.once(clonedForm, 'value');
  let receivedNonClonedValues = false;
  form.once('value', () => {
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
    {}
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
          id: undefined,
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

it('should take snapshot', () => {
  const form = createForm();

  const firstName = form.getField('firstName');

  const setValues = {
    hidden: true,
    required: true,
    out: true,
    in: true
  };

  firstName.set(setValues);

  // Restore before snapshot is taken
  form.set({ snapshot: 'restore' });

  expect(firstName.get(['hidden', 'required', 'out', 'in'])).toEqual(setValues);

  form.set({ snapshot: 'take' });

  firstName.set({
    hidden: false,
    required: false,
    out: false,
    in: false
  });

  form.set({ snapshot: 'restore' });

  expect(firstName.get(['hidden', 'required', 'out', 'in'])).toEqual(setValues);
});

it('should clear values', () => {
  const form = createForm({
    value: {
      firstName: 'First',
      middleName: 'Middle',
      lastName: 'Last'
    }
  });

  form.set({ clear: false });
  expect(form.getValues()).toEqual({
    id: undefined,
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  });

  form.set({ clear: true });
  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(null),
    firstName: null,
    middleName: null,
    lastName: null
  });
});

it('should reset', () => {
  const form = createForm();

  const resetSpy = jest.spyOn(form, 'reset');

  form.set({ reset: false });
  expect(resetSpy).toHaveBeenCalledTimes(0);

  form.set({ reset: true });
  expect(resetSpy).toHaveBeenCalledTimes(1);
});

it('should auto validate on touch', async () => {
  const form = createForm();

  const validateSpy = jest.spyOn(form, 'validate');
  const setSpy = jest.spyOn(form, 'set');

  form._handleFieldTouchedFactory()(false);
  expect(setSpy).toHaveBeenCalledTimes(0);

  form._handleFieldTouchedFactory()(true);
  expect(setSpy).toHaveBeenCalledWith({ touched: true });
  expect(validateSpy).toHaveBeenCalledTimes(0);

  form.set({ autoValidate: true });

  const afterErr = testUtils.once(form, 'err');

  form.getField('firstName').set({ touched: true });

  await afterErr;
  expect(form.getErrs()).toEqual([
    { field: 'firstName', error: 'required' },
    { field: 'middleName', error: 'required' },
    { field: 'lastName', error: 'required' }
  ]);

  expect(validateSpy).toHaveBeenCalledTimes(1);
});

it('get field should through when field is missing', () => {
  const form = new Form();
  expect(() => form.getField('firstName')).toThrow('missing field firstName');
});

it('should get values', () => {
  const firstName = new TextField({
    name: 'firstName',
    label: 'First Name',
    required: true
  });

  const form = new Form({
    fields: [firstName],
    value: {
      firstName: 'firstName'
    }
  });

  const defaults = {
    id: undefined
  };

  expect(form.getValues()).toEqual({ ...defaults, firstName: 'firstName' });
  expect(form.getValues({ in: true })).toEqual({
    ...defaults,
    firstName: 'firstName'
  });
  expect(form.getValues({ in: false })).toEqual({ ...defaults });

  firstName.set({ in: false });

  expect(form.getValues()).toEqual({ ...defaults, firstName: 'firstName' });
  expect(form.getValues({ in: false })).toEqual({
    ...defaults,
    firstName: 'firstName'
  });
  expect(form.getValues({ in: true })).toEqual({ ...defaults });

  expect(form.getValues({ default: true })).toEqual({ ...defaults });
  expect(form.getValues({ default: false })).toEqual({
    firstName: 'firstName'
  });
});

it('should set full width', () => {
  const form = createForm();

  form.set({ fullWidth: true });

  for (let field of form.getFields()) {
    expect(field.get('fullWidth')).toEqual(true);
  }
});

it('should check if has error for touched field', () => {
  const form = createForm();
  form.validate();
  expect(form.hasErrorForTouchedField()).toEqual(false);

  form.getField('firstName').set({ touched: true });
  expect(form.hasErrorForTouchedField()).toEqual(true);
});

it('should submit', () => {
  const form = createForm();

  const emitClickOnButtonSpy = jest.spyOn(form, '_emitClickOnButton');

  form.submit();
  expect(emitClickOnButtonSpy).toHaveBeenCalledTimes(0);

  form.set({
    fields: [new ButtonField({ name: 'submit', type: 'submit' })]
  });

  form.submit();
  expect(emitClickOnButtonSpy).toHaveBeenCalledWith(form.getField('submit'));
});

it('should clone fields', () => {
  const form1 = createForm({
    value: {
      firstName: 'Augusta',
      middleName: 'Ada',
      lastName: 'King'
    }
  });

  const form2 = new Form();
  form2.cloneFields(form1);
  form2.set({
    value: {
      firstName: 'Ada',
      middleName: null,
      lastName: 'Lovelace'
    }
  });

  expect(form1.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Augusta',
    middleName: 'Ada',
    lastName: 'King'
  });

  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Ada',
    middleName: null,
    lastName: 'Lovelace'
  });
});

it('should set for each field', () => {
  const form = createForm();

  const props = {
    hidden: true,
    editable: false,
    useDisplayValue: true
  };

  form.set({ eachField: props });

  const keys = Object.keys(props);
  form.eachField(field => expect(field.get(keys)).toEqual(props));
});

it('should set useDisplayValue', () => {
  const form = createForm();
  form.eachField(field => expect(field.get('useDisplayValue')).toBeUndefined());

  form.set({ useDisplayValue: true });
  form.eachField(field => expect(field.get('useDisplayValue')).toEqual(true));
});

it('should elevate', async () => {
  const personNameForm = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ],
    validators: [
      {
        where: {
          fields: {
            lastName: {
              value: 'Vader'
            }
          }
        },
        error: {
          field: 'lastName',
          error: 'nope'
        }
      }
    ],
    listeners: [
      {
        event: 'create',
        actions: [
          new Set({ name: 'fields.firstName.label', value: 'First Name' })
        ]
      }
    ]
  });

  // Used to make sure default fields are not elevated
  personNameForm.getField('archivedAt').now();

  const form = new Form({
    fields: [
      new FormField({
        name: 'fullName',
        form: personNameForm,
        elevate: true
      })
    ]
  });

  form.setValues({
    firstName: 'Darth',
    lastName: 'Vader'
  });

  expect(form.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    firstName: 'Darth',
    lastName: 'Vader'
  });

  form.validate();
  expect(form.getErrs()).toEqual([{ field: 'lastName', error: 'nope' }]);

  await form.resolveAfterCreate();
  expect(form.getField('firstName').get('label')).toEqual('First Name');
});

it('should clear errors', () => {
  const form = createForm();
  form.validate();
  expect(form.getField('firstName').hasErr()).toEqual(true);

  form.set({ clearErrs: true });
  form.eachField(field => expect(field.hasErr()).toEqual(false));
});

it('should destroy', () => {
  const form = createForm();

  const removeAllListenersSpy = jest.spyOn(form, 'removeAllListeners');
  const fieldSpies = form.mapFields(field => jest.spyOn(field, 'destroy'));

  form.destroy();
  expect(removeAllListenersSpy).toHaveBeenCalledTimes(1);
  expect(fieldSpies).toHaveLength(testUtils.defaultFields.length + 3);
  fieldSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
});

it('should add non-field', () => {
  const form = new Form();
  form.addField(
    new Text({
      name: 'text',
      text: 'Wecome'
    })
  );
  expect(form.getField('text').getClassName()).toEqual('ComponentField');
});

it('should set field err and throw', () => {
  const form1 = createForm();
  const form2 = createForm();
  form2.getField('firstName').setErr('nope');
  expect(() => form1.setFieldErrAndThrow('firstName', 'nope')).toThrow(
    new FormErr({ form: form2 })
  );
});

it('should add field before and after', () => {
  const form = new Form({
    fields: [new TextField({ name: 'lastName' })]
  });

  form.set({
    fields: [
      new TextField({ name: 'firstName', before: 'lastName' }),
      new TextField({ name: 'middleName', after: 'firstName' })
    ]
  });

  const expectedNames = ['firstName', 'middleName', 'lastName'];

  const names = [];
  form.eachField(field => {
    const name = field.get('name');
    if (expectedNames.indexOf(name) !== -1) {
      names.push(name);
    }
  });
  expect(names).toEqual(expectedNames);
});

it('should modify fields with properties', () => {
  const form = new Form({
    fields: [new TextField({ name: 'lastName', label: 'Last Name' })]
  });

  expect(form.getField('lastName').get('required')).toEqual(false);

  form.set({
    fields: [
      {
        name: 'lastName',
        required: true
      }
    ]
  });

  expect(form.getField('lastName').get('required')).toEqual(true);

  // Make sure label was preserved
  expect(form.getField('lastName').get('label')).toEqual('Last Name');

  // Add the extended field as there is nothing to actually extend
  form.set({
    fields: [
      new ExtendedField({
        name: 'firstName',
        properties: {
          label: 'First Name'
        }
      })
    ]
  });
  expect(form.getField('firstName').get('properties')).toEqual({
    label: 'First Name'
  });
});
