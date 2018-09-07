import FormsField from './forms-field';
import TextField from './text-field';
import Form from '../form';
import _ from '../lodash';
import testUtils from '../test-utils';
import utils from '../utils';
import compiler from '../compiler';
import Emit from '../actions/emit';

const formName = utils.uuid();

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
    ],

    // Needed so that parent is populated in fillerProps
    listeners: [
      {
        event: 'foo',
        actions: [
          new Emit({
            event: 'didFoo'
          })
        ]
      }
    ],

    ...props
  });
};

const createField = props => {
  return new FormsField({
    label: 'People',
    singularLabel: 'Person',
    form: createForm(),
    ...props
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
    showArchived: false
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
    showArchived: false
  });
});

const shouldAddFormsQuickly = (field, milliseconds) => {
  return testUtils.expectToFinishBefore(async () => {
    // Set the parent to simulate usage in the UI as adding the parent can slow cloning
    field.get('form').set({ parent: field });

    // Trigger an action so that the parent is added to the fillerProps as this can also slow down
    // cloning
    const didFoo = testUtils.once(field.get('form'), 'didFoo');
    field.get('form').emitChange('foo');
    await didFoo;

    for (let i = 0; i < 40; i++) {
      field.addForm({
        firstName: 'First ' + i,
        lastName: 'Last ' + i
      });
    }
  }, milliseconds);
};

const ADD_FORMS_COMPILED_TIMEOUT_MS = 700;
it('should add many forms quickly when using compiled components', () => {
  const field = createField();

  return shouldAddFormsQuickly(field, ADD_FORMS_COMPILED_TIMEOUT_MS);
});

const ADD_FORMS_UNCOMPILED_TIMEOUT_MS = 700;
it('should add many forms quickly when using uncompiled components', () => {
  const field = compiler.newComponent({
    component: 'FormsField',
    form: {
      component: formName,

      // Needed so that parent is populated in fillerProps
      listeners: [
        {
          event: 'foo',
          actions: [
            {
              component: 'Emit',
              event: 'didFoo'
            }
          ]
        }
      ]
    }
  });

  return shouldAddFormsQuickly(field, ADD_FORMS_UNCOMPILED_TIMEOUT_MS);
});

it('save should handle errors', async () => {
  const field = createField();

  const createdForm = new Form();

  const setSpy = jest.spyOn(field, 'set');
  const saveFormSpy = jest
    .spyOn(field, '_saveForm')
    .mockImplementation(() => createdForm);
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
  expect(setSpy).toHaveBeenCalledWith({
    currentForm: createdForm,
    // mode: 'read'
    mode: null
  });
});

it('should save', async () => {
  const field = createField();

  const store = {
    createItem: async () => ({
      id: 'myId',
      userId: 'myUserId'
    }),
    updateItem: async () => {},
    on: () => {},
    removeAllListeners: () => {}
  };

  field.set({ store });

  const createSpy = jest.spyOn(store, 'createItem');
  const updateSpy = jest.spyOn(store, 'updateItem');

  const jack = {
    firstName: 'Jack',
    lastName: 'Johnson'
  };

  const form = field.get('form');

  form.setValues(jack);

  // Create
  await field.save();
  expect(createSpy).toHaveBeenCalledWith({ form });
  expect(form.getValue('id')).toEqual('myId');
  expect(form.get('userId')).toEqual('myUserId');
  expect(field.getValue()).toHaveLength(1);

  // Update
  form.setValues({ lastName: 'Ryan' });
  await field.save();
  expect(updateSpy).toHaveBeenCalledWith({ form, id: form.getValue('id') });
  expect(field.getValue()).toHaveLength(1);

  // Simulate the lack of a store
  field.set({ store: null });
  form.clearValues();
  form.setValues(jack);
  await field.save();
  expect(form.getValue('id')).not.toBeUndefined();
  expect(field.getValue()).toHaveLength(2);
  form.setValues({ lastName: 'Ryan' });
  await field.save();
  expect(form.getValue('lastName')).toEqual('Ryan');
  expect(field.getValue()).toHaveLength(2);
});

it('should archive', async () => {
  const field = createField();

  const archivedAt = new Date();

  const store = {
    updateItem: async () => {},
    archiveItem: async () => ({
      archivedAt
    }),
    on: () => {},
    removeAllListeners: () => {}
  };

  field._globals = {
    displaySnackbar: () => {}
  };

  field.set({ store });

  const archiveSpy = jest.spyOn(store, 'archiveItem');
  const displaySnackbarSpy = jest.spyOn(field._globals, 'displaySnackbar');

  const jack = {
    id: 'jack',
    firstName: 'Jack',
    lastName: 'Johnson'
  };

  const form = field.get('form');

  form.setValues(jack);

  // Create
  await field.save();

  // Archive
  const didArchiveRecord = testUtils.once(form, 'didArchiveRecord');
  await field.archive(form);
  expect(archiveSpy).toHaveBeenCalledWith({ form, id: form.getValue('id') });
  expect(form.get('archivedAt')).toEqual(archivedAt);
  expect(field.getValue()).toHaveLength(0);
  expect(displaySnackbarSpy).toHaveBeenCalledWith('Person deleted');
  await didArchiveRecord;

  // Simulate the lack of a store
  field.set({ store: null });
  form.clearValues();
  form.setValues(jack);
  await field.save();
  await field.archive(form);
  expect(field.getValue()).toHaveLength(0);
});

it('should restore', async () => {
  const field = createField();

  const archivedAt = new Date();

  const store = {
    updateItem: async () => {},
    restoreItem: async () => {},
    on: () => {},
    removeAllListeners: () => {}
  };

  field._globals = {
    displaySnackbar: () => {}
  };

  field.set({ store });

  const restoreSpy = jest.spyOn(store, 'restoreItem');
  const displaySnackbarSpy = jest.spyOn(field._globals, 'displaySnackbar');

  const jack = {
    id: 'jack',
    firstName: 'Jack',
    lastName: 'Johnson'
  };

  const form = field.get('form');
  form.set({ archivedAt });

  form.setValues(jack);

  // Create
  await field.save();

  // Archive
  const didRestoreRecord = testUtils.once(form, 'didRestoreRecord');
  await field.restore(form);
  expect(restoreSpy).toHaveBeenCalledWith({ form, id: form.getValue('id') });
  expect(form.get('archivedAt')).toBeNull();
  expect(field.getValue()).toHaveLength(0);
  expect(displaySnackbarSpy).toHaveBeenCalledWith('Person restored');
  await didRestoreRecord;

  // Simulate the lack of a store
  field.set({ store: null });
  form.clearValues();
  form.setValues(jack);
  await field.save();
  await field.restore(form);
  expect(field.getValue()).toHaveLength(0);
});

it('should handle missing form', () => {
  const field = new FormsField();
  field.emitLoad();
  field.emitUnload();
});

it('should clear and get all', async () => {
  const field = new FormsField();
  const clearSpy = jest.spyOn(field._forms, 'clear');
  const resetInfiniteLoaderSpy = jest.spyOn(field, '_resetInfiniteLoader');
  const updateInfiniteLoaderSpy = jest.spyOn(field, '_updateInfiniteLoader');
  const getAllSpy = jest.spyOn(field._infiniteLoader, 'getAll');
  await field._clearAndGetAll();
  expect(clearSpy).toHaveBeenCalledTimes(1);
  expect(resetInfiniteLoaderSpy).toHaveBeenCalledTimes(1);
  expect(updateInfiniteLoaderSpy).toHaveBeenCalledTimes(1);
  expect(getAllSpy).toHaveBeenCalledTimes(1);
});

it('should handle show archived', () => {
  const field = new FormsField();
  field._handleShowArchivedFactory()(true);
  expect(field.get('showArchived')).toEqual(true);
});

const searchString = {
  $and: [
    {
      $or: [
        { 'fieldValues.firstName': { $iLike: 'foo%' } },
        { 'fieldValues.lastName': { $iLike: 'foo%' } }
      ]
    }
  ]
};

it('should convert where to search string', () => {
  const field = createField();
  expect(field._toWhereFromSearchString()).toBeNull();

  field.set({ searchString: 'foo' });
  expect(field._toWhereFromSearchString()).toEqual(searchString);
});

it('should handle search string', async () => {
  const field = createField();

  const clearAndGetAllSpy = jest.spyOn(field, '_clearAndGetAll');

  field._handleSearchStringFactory()('foo');
  expect(field.get('searchString')).toEqual('foo');
  expect(field._where).toEqual(searchString);
  expect(clearAndGetAllSpy).toHaveBeenCalledTimes(0);

  const didLoad = testUtils.once(field, 'didLoad');
  field.emitLoad();
  await didLoad;
  field._handleSearchStringFactory()('foo');
  expect(clearAndGetAllSpy).toHaveBeenCalledTimes(1);
});

it('should handle order', async () => {
  const field = createField();

  const clearAndGetAllSpy = jest.spyOn(field, '_clearAndGetAll');

  const order = [['firstName', 'asc']];

  field._handleOrderFactory()(order);
  expect(field.get('order')).toEqual(order);
  expect(clearAndGetAllSpy).toHaveBeenCalledTimes(0);

  const didLoad = testUtils.once(field, 'didLoad');
  field.emitLoad();
  await didLoad;
  field._handleOrderFactory()(order);
  expect(clearAndGetAllSpy).toHaveBeenCalledTimes(1);
});

it('should handle scroll', async () => {
  const field = createField();

  const scrollY = 100;

  field._window = {
    scrollY
  };
  const scrollSpy = jest.spyOn(field._infiniteLoader, 'scroll');

  field._handleScrollFactory()();
  expect(scrollSpy).toHaveBeenCalledWith({ scrollY });
});

it('should reach max', async () => {
  const field = createField({ maxSize: 1 });

  expect(field.reachedMax()).toEqual(false);

  const jack = {
    firstName: 'Jack',
    lastName: 'Johnson'
  };

  const form = field.get('form');

  form.setValues(jack);

  // Create
  await field.save();

  expect(field.reachedMax()).toEqual(true);
});

it('should validate min size', () => {
  const field = createField({ minSize: 1 });
  field.validate();
  expect(field.getErr()).toEqual([{ error: '1 or more' }]);
});

it('should get singular label', () => {
  const field = new FormsField();
  expect(field.getSingularLabel()).toBeNull();

  field.set({ label: 'Records' });
  expect(field.getSingularLabel()).toEqual('Record');

  field.set({ singularLabel: 'Rec' });
  expect(field.getSingularLabel()).toEqual('Rec');
});

// TODO: restore after clone() is fixed
// it('should clone', () => {
//   const field = createField();
//   const form = field.get('form');
//   const clonedField = field.clone();
//   expect(clonedField.get('form')).not.toEqual(form);
// });
