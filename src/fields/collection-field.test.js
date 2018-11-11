import CollectionField from './collection-field';
import TextField from './text-field';
import DateField from './date-field';
import Form from '../form';
import each from 'lodash/each';
import testUtils from '../test-utils';
import utils from '../utils';
import compiler from '../compiler';
import Emit from '../actions/emit';
import Factory from '../component/factory';

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
  return new CollectionField({
    label: 'People',
    singularLabel: 'Person',
    formFactory: new Factory({
      product: () => createForm()
    }),
    ...props
  });
};

const fillDocs = field => {
  field.addForm({
    values: { id: 1, firstName: 'Ella', lastName: 'Fitzgerald' },
    synchronous: true
  });
  field.addForm({
    values: { id: 2, firstName: 'Frank', lastName: 'Sinatra' },
    synchronous: true
  });
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

  const defaults = testUtils.toDefaultFieldsObject(undefined);

  expect(forms[0].getValues()).toEqual({
    ...defaults,
    id: 1,
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  });
  expect(forms[1].getValues()).toEqual({
    ...defaults,
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

  const defaults = testUtils.toDefaultFieldsObject(undefined);

  expect(field.getValue()).toEqual([
    {
      ...defaults,
      ...value[0]
    },
    {
      ...defaults,
      ...value[1]
    }
  ]);
});

it('should clear errors for nested forms', async () => {
  const field = createField();
  await field.setValue([
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

  each(properties, (value, prop) => {
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
    searchString: null,
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
    scrollThreshold: CollectionField.SCROLLTHRESHOLD_DEFAULT,
    itemsPerPage: CollectionField.ITEMS_PER_PAGE_DEFAULT,
    maxBufferPages: CollectionField.MAX_BUFFER_PAGES_DEFAULT,
    spacerHeight: 0,
    order: null,
    mode: null,
    showArchived: false
  });
});

it('save add form', async () => {
  const field = createField();

  const form = field.get('form');
  const addForm = jest.spyOn(field, '_addForm');
  const addFormSynchronous = jest.spyOn(field, '_addFormSynchronous');
  const addFormAsynchronous = jest.spyOn(field, '_addFormAsynchronous');
  const calcValueSpy = jest.spyOn(field, '_calcValue');

  // Adds synchronously as form specified
  const ella = { id: 1, firstName: 'Ella', lastName: 'Fitzgerald' };
  const form1 = field.addForm({
    form,
    values: ella
  });
  expect(form1.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    ...ella
  });
  expect(addForm).toHaveBeenCalledTimes(1);
  expect(addFormSynchronous).toHaveBeenCalledTimes(0);
  expect(addFormAsynchronous).toHaveBeenCalledTimes(0);
  expect(calcValueSpy).toHaveBeenCalledTimes(1);

  // Add asynchronously
  const ray = { id: 2, firstName: 'Ray', lastName: 'Charles' };
  const form2 = await field.addForm({
    values: ray
  });
  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(null),
    ...ray
  });
  expect(addForm).toHaveBeenCalledTimes(2);
  expect(addFormSynchronous).toHaveBeenCalledTimes(0);
  expect(addFormAsynchronous).toHaveBeenCalledTimes(1);

  // Add synchronously as synchronous=true
  const frank = { id: 2, firstName: 'Frank', lastName: 'Sinatra' };
  const form3 = field.addForm({
    values: frank,
    synchronous: true
  });
  expect(form3.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    ...frank
  });
  expect(addForm).toHaveBeenCalledTimes(3);
  expect(addFormSynchronous).toHaveBeenCalledTimes(1);
  expect(addFormAsynchronous).toHaveBeenCalledTimes(1);
});

it('save update form', async () => {
  const field = createField();

  const form = field.get('form');
  // Add
  const ella = { id: 1, firstName: 'Ella', lastName: 'Fitzgerald' };
  const form1 = field.addForm({
    form,
    values: ella
  });

  // Update
  const calcValueSpy = jest.spyOn(field, '_calcValue');
  ella.lastName = 'Fitz';
  const form2 = field.updateForm({
    form: form1,
    values: ella
  });
  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    ...ella
  });
  expect(calcValueSpy).toHaveBeenCalledTimes(1);
  expect(field.getValue()).toEqual([
    {
      ...testUtils.toDefaultFieldsObject(undefined),
      ...ella
    }
  ]);
});

it('save remove form', async () => {
  const field = createField();

  const form = field.get('form');
  // Add
  const ella = { id: 1, firstName: 'Ella', lastName: 'Fitzgerald' };
  const form1 = field.addForm({
    form,
    values: ella
  });

  // Remove
  const calcValueSpy = jest.spyOn(field, '_calcValue');
  const form2 = field.removeForm(form1.getValue('id'));
  expect(form2.getValues()).toEqual({
    ...testUtils.toDefaultFieldsObject(undefined),
    ...ella
  });
  expect(calcValueSpy).toHaveBeenCalledTimes(1);
  expect(field.getValue()).toEqual([]);
});

it('save should handle errors', async () => {
  const field = createField();

  const createdForm = new Form();

  const form = field.get('form');
  const setSpy = jest.spyOn(field, 'set');
  const saveFormSpy = jest
    .spyOn(field, '_saveForm')
    .mockImplementation(() => createdForm);

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

const updateDocMock = () => async props => {
  return {
    id: props.form.getValue('id')
  };
};

it('should save', async () => {
  const field = createField();

  const store = {
    createDoc: async () => ({
      id: 'myId'
    }),
    updateDoc: updateDocMock,
    on: () => {},
    removeAllListeners: () => {}
  };

  field.set({ store });

  const createSpy = jest.spyOn(store, 'createDoc');
  const updateSpy = jest.spyOn(store, 'updateDoc');

  const jack = {
    firstName: 'Jack',
    lastName: 'Johnson',
    userId: 'myUserId'
  };

  const form = field.get('form');

  form.setValues(jack);

  // Create
  await field.save();
  expect(createSpy).toHaveBeenCalledWith({ form, reorder: false });
  expect(form.getValue('id')).toEqual('myId');
  expect(form.getValue('userId')).toEqual('myUserId');
  expect(field.getValue()).toHaveLength(1);

  // Update
  form.setValues({ lastName: 'Ryan' });
  await field.save();
  expect(updateSpy).toHaveBeenCalledWith({ form, reorder: false });
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

  const archivedAt = new DateField({ now: true });

  const store = {
    updateDoc: updateDocMock,
    archiveDoc: async () => ({
      archivedAt: archivedAt.getValue()
    }),
    on: () => {},
    removeAllListeners: () => {}
  };

  field._globals = {
    displaySnackbar: () => {}
  };

  field.set({ store });

  const archiveSpy = jest.spyOn(store, 'archiveDoc');
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
  expect(archiveSpy).toHaveBeenCalledWith({
    form,
    id: form.getValue('id'),
    reorder: false
  });
  expect(form.getValue('archivedAt')).toEqual(archivedAt.getValue());
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
    updateDoc: updateDocMock,
    restoreDoc: async () => {},
    on: () => {},
    removeAllListeners: () => {}
  };

  field._globals = {
    displaySnackbar: () => {}
  };

  field.set({ store });

  const restoreSpy = jest.spyOn(store, 'restoreDoc');
  const displaySnackbarSpy = jest.spyOn(field._globals, 'displaySnackbar');

  const jack = {
    id: 'jack',
    archivedAt,
    firstName: 'Jack',
    lastName: 'Johnson'
  };

  const form = field.get('form');

  form.setValues(jack);

  // Create
  await field.save();

  // Archive
  const didRestoreRecord = testUtils.once(form, 'didRestoreRecord');
  await field.restore(form);
  expect(restoreSpy).toHaveBeenCalledWith({
    form,
    id: form.getValue('id'),
    reorder: false
  });
  expect(form.getValue('archivedAt')).toBeNull();
  expect(field.getValue()).toHaveLength(0);
  expect(displaySnackbarSpy).toHaveBeenCalledWith('Person restored');
  await didRestoreRecord;

  // Simulate the lack of a store and forbidOrder=false
  field.set({ store: null, forbidOrder: false });
  form.clearValues();
  form.setValues(jack);
  await field.save();
  await field.restore(form);
  expect(field.getValue()).toHaveLength(0);
});

it('should handle missing form', () => {
  const field = new CollectionField();
  field.emitLoad();
  field.emitUnload();
});

it('should clear and get all', async () => {
  const field = new CollectionField();
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
  const field = new CollectionField();
  field._handleShowArchivedFactory()(true);
  expect(field.get('showArchived')).toEqual(true);
});

const searchStringWhere = {
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
  expect(field._toWhereFromSearchString()).toEqual(searchStringWhere);
});

it('should handle search string', async () => {
  const field = createField();

  const clearAndGetAllSpy = jest.spyOn(field, '_clearAndGetAll');

  expect(field._getWhere()).toBeUndefined();

  field._handleSearchStringFactory()('foo');
  expect(field.get('searchString')).toEqual('foo');
  expect(field._getWhere()).toEqual(searchStringWhere);
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
  const field = new CollectionField();
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

it('should set maxColumns', () => {
  const field = new CollectionField();

  const allowed = [1, 2, 4, 6, 12];
  allowed.forEach(maxColumns => field.set({ maxColumns }));

  const notAllowed = [0, 3, 13];
  notAllowed.forEach(maxColumns =>
    expect(() => field.set({ maxColumns })).toThrow()
  );
});

it('should destroy', () => {
  const field = createField();
  fillDocs(field);

  const removeAllListenersSpy = jest.spyOn(field, 'removeAllListeners');
  const formSpies = field._forms.map(form => jest.spyOn(form, 'destroy'));

  field.destroy();
  expect(removeAllListenersSpy).toHaveBeenCalledTimes(1);
  expect(formSpies).toHaveLength(2);
  formSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
});

it('should move and save form', async () => {
  const field = createField();

  const form = field.get('form');

  // Create
  form.setValues({
    firstName: 'Mos',
    lastName: 'Def',
    order: 0
  });
  let mosForm = await field.save();

  // Create another
  form.clearValues();
  form.setValues({
    firstName: 'Talib',
    lastName: 'Kweli',
    order: 1
  });
  let talibForm = await field.save();

  // Move
  const movedForm = await field.moveAndSaveForm({
    sourceIndex: 0,
    destinationIndex: 1
  });
  expect(movedForm.getValues()).toMatchObject({
    firstName: 'Mos',
    lastName: 'Def',
    order: 1
  });

  // Verify that form orders were updated
  const updatedTalibForm = field.getForm(talibForm.getValue('id'));
  expect(updatedTalibForm.getValues()).toMatchObject({
    firstName: 'Talib',
    lastName: 'Kweli',
    order: 1 // Still at 1 as store will update
  });
  const updatedMosForm = field.getForm(mosForm.getValue('id'));
  expect(updatedMosForm.getValues()).toMatchObject({
    firstName: 'Mos',
    lastName: 'Def',
    order: 1
  });
});

it('should move', async () => {
  const field = createField({ forbidOrder: false });

  const form = field.get('form');

  // Create
  form.setValues({
    firstName: 'Mos',
    lastName: 'Def',
    order: 0
  });
  await field.save();

  // Create again
  form.clearValues();
  form.setValues({
    firstName: 'Talib',
    lastName: 'Kweli',
    order: 1
  });
  await field.save();

  const calcValueSpy = jest.spyOn(field, '_calcValue');

  // Move down
  field.moveForm({ sourceIndex: 0, destinationIndex: 1 });
  expect(field._forms.map(form => form.getValues())).toMatchObject([
    {
      firstName: 'Talib',
      order: 1 // Still at 1 as the store will change this
    },
    {
      firstName: 'Mos',
      order: 1
    }
  ]);
  expect(calcValueSpy).toHaveBeenCalledTimes(1);

  // Move up
  field.moveForm({ sourceIndex: 1, destinationIndex: 0 });
  expect(field._forms.map(form => form.getValues())).toMatchObject([
    {
      firstName: 'Mos',
      order: 0
    },
    {
      firstName: 'Talib',
      order: 1 // Still at 1 as the store will change this
    }
  ]);
});

it('should get order', () => {
  const field = createField({ order: [['createdAt', 'ASC']] });
  expect(field._getOrder()).toEqual([['createdAt', 'ASC']]);

  field.set({ order: null });
  expect(field._getOrder()).toEqual([['order', 'ASC']]);
});

it('should get items per page', () => {
  const field = createField({ itemsPerPage: 2 });
  expect(field._getItemsPerPage()).toEqual(2);

  field.set({ forbidOrder: false });
  expect(field._getItemsPerPage()).toEqual(CollectionField.MAX_ITEMS_PER_PAGE);
});

it('should get max size', () => {
  const field = createField({ maxSize: 2 });
  expect(field._getMaxSize()).toEqual(2);

  field.set({ forbidOrder: false });
  expect(field._getMaxSize()).toEqual(CollectionField.MAX_ITEMS_PER_PAGE);
});

it('should map forms', () => {
  const field = createField();
  fillDocs(field);
  expect(field.mapForms(form => form.getValue('firstName'))).toEqual([
    'Ella',
    'Frank'
  ]);
});
