import CollectionField from './collection-field';
import MemoryStore from '../stores/memory-store';
import Form from '../form';
import TextField from '../fields/text-field';
import Factory from '../component/factory';

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName', label: 'First Name', required: true }),
      new TextField({ name: 'lastName', label: 'Last Name', required: true })
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

it('should set store', () => {
  const store1 = new MemoryStore();
  const removeAllListenersSpy1 = jest.spyOn(store1, 'removeAllListeners');
  const onSpy1 = jest.spyOn(store1, 'on');

  const store2 = new MemoryStore();
  const removeAllListenersSpy2 = jest.spyOn(store2, 'removeAllListeners');
  const onSpy2 = jest.spyOn(store2, 'on');

  // Initialize
  const field = new CollectionField({ store: store1 });
  expect(onSpy1).toHaveBeenCalledTimes(1);

  // Store isn't changing
  field.set({ store: store1 });
  expect(removeAllListenersSpy1).toHaveBeenCalledTimes(0);
  expect(onSpy1).toHaveBeenCalledTimes(1);

  // Store changing
  field.set({ store: store2 });
  expect(removeAllListenersSpy1).toHaveBeenCalledTimes(1);
  expect(onSpy2).toHaveBeenCalledTimes(1);

  // Clear store
  field.set({ store: null });
  expect(removeAllListenersSpy2).toHaveBeenCalledTimes(1);
});

it('should listen to store changes', async () => {
  const store = new MemoryStore();
  const formFactory = new Factory({
    product: () => {
      return new Form({
        fields: [new TextField({ name: 'firstName' })]
      });
    }
  });
  const field = new CollectionField({
    showArchived: false,
    store,
    formFactory
  });
  const upsertFormSpy = jest.spyOn(field, 'upsertForm');
  const removeFormSpy = jest.spyOn(field, 'removeForm');

  const value = {
    value: {
      id: '1',
      fieldValues: {
        firstName: 'Sammy'
      },
      archivedAt: null,
      userId: '1',
      cursor: 'cursor',
      order: 1
    }
  };

  const value2 = {
    value: {
      id: '2',
      fieldValues: {
        firstName: 'Stevie'
      },
      archivedAt: null,
      userId: '2',
      cursor: 'cursor',
      order: 2
    }
  };

  // Ignore other events
  await field._handleStoreChangeFactory()('otherEvent', null);
  expect(upsertFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Create fails as archivedAt does not match
  field.set({ showArchived: true });
  await field._handleStoreChangeFactory()('createDoc', value);
  expect(upsertFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);
  field.set({ showArchived: false });

  const muteChange = false;

  // Create
  await field._handleStoreChangeFactory()('createDoc', value);
  expect(upsertFormSpy).toHaveBeenCalledWith({
    values: {
      ...value.value.fieldValues,
      id: value.value.id,
      archivedAt: value.value.archivedAt,
      userId: value.value.userId,
      order: value.value.order
    },
    muteChange,
    cursor: value.value.cursor
  });

  // Create and insert before the first value
  await field._handleStoreChangeFactory()('createDoc', value2);
  expect(upsertFormSpy).toHaveBeenCalledWith({
    values: {
      ...value2.value.fieldValues,
      id: value2.value.id,
      archivedAt: value2.value.archivedAt,
      userId: value2.value.userId,
      order: value2.value.order
    },
    muteChange,
    cursor: value2.value.cursor
  });

  // Update and move
  value.value.order = 2.1;
  await field._handleStoreChangeFactory()('updateDoc', value);
  expect(upsertFormSpy).toHaveBeenCalledWith({
    values: {
      ...value.value.fieldValues,
      id: value.value.id,
      archivedAt: value.value.archivedAt,
      userId: value.value.userId,
      order: value.value.order
    },
    muteChange,
    cursor: value.value.cursor
  });

  // Update leads to delete as archivedAt changing
  value.value.archivedAt = new Date();
  await field._handleStoreChangeFactory()('updateDoc', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
  value.value.archivedAt = null;

  // Prepare for deleteDoc by creating again
  await field._handleStoreChangeFactory()('createDoc', value);
  removeFormSpy.mockReset();

  // Delete fails as item not found
  await field._handleStoreChangeFactory()('deleteDoc', {
    value: { value: { id: 'missing id' } }
  });
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Delete
  await field._handleStoreChangeFactory()('deleteDoc', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
});

it('should create and update', async () => {
  const store = new MemoryStore();
  const field = createField({ store, forbidOrder: false });

  const created = {
    id: 'id',
    createdAt: new Date('2018-01-01').getTime(),
    updatedAt: new Date('2018-01-01').getTime(),
    order: 0,
    userId: 'myId'
  };

  const updated = {
    id: 'id',
    createdAt: new Date('2018-01-01').getTime(),
    updatedAt: new Date('2018-01-02').getTime(),
    order: 1,
    userId: 'myId'
  };

  // Mock
  store.createDoc = async () => created;
  store.updateDoc = async () => updated;

  const form = field.get('form');

  // Create
  form.setValues({
    firstName: 'Mos',
    lastName: 'Def'
  });
  let mosForm = await field.save();
  expect(mosForm.getValues()).toMatchObject(created);

  // Update
  mosForm = await field.save();
  expect(mosForm.getValues()).toMatchObject(updated);
});

it('should not have side effects', async () => {
  const store = new MemoryStore();
  const field = createField({ store, forbidOrder: false });

  const form = field.get('form');

  // Create
  form.setValues({
    firstName: 'Mos',
    lastName: 'Def'
  });
  let mosForm = await field.save();
  let mos = await store.getDoc({ id: mosForm.getValue('id') });
  expect(mos).toMatchObject({
    fieldValues: {
      firstName: 'Mos',
      lastName: 'Def'
    },
    order: 0
  });

  // Update
  mosForm = field.getForm(mosForm.getValue('id'));
  mosForm.setValues({ lastName: 'Smith' });
  field.updateForm({ values: mosForm.getValues() });
  mosForm = field.getForm(mosForm.getValue('id'));
  expect(mosForm.getValues()).toMatchObject({
    firstName: 'Mos',
    lastName: 'Smith',
    order: 0
  });
  mos = await store.getDoc({ id: mosForm.getValue('id') });
  expect(mos).toMatchObject({
    fieldValues: {
      firstName: 'Mos',
      lastName: 'Def'
    },
    order: 0
  });

  // TODO: archive

  // TODO: restore

  // Create again so that we can move
  form.clearValues();
  form.setValues({
    firstName: 'Talib',
    lastName: 'Kweli',
    order: 1
  });
  let talibForm = await field.save();

  // Move
  field.moveForm({ sourceIndex: 0, destinationIndex: 1 });
  mosForm = field.getForm(mosForm.getValue('id'));
  expect(mosForm.getValues()).toMatchObject({
    firstName: 'Mos',
    lastName: 'Smith',
    order: 1
  });
  talibForm = field.getForm(talibForm.getValue('id'));
  expect(talibForm.getValues()).toMatchObject({
    firstName: 'Talib',
    lastName: 'Kweli',
    order: 1 // Still at 1 as the store will change this
  });
  mos = await store.getDoc({ id: mosForm.getValue('id') });
  expect(mos).toMatchObject({
    fieldValues: {
      firstName: 'Mos',
      lastName: 'Def'
    },
    order: 0
  });
  let talib = await store.getDoc({ id: talibForm.getValue('id') });
  expect(talib).toMatchObject({
    fieldValues: {
      firstName: 'Talib',
      lastName: 'Kweli'
    },
    order: 1
  });

  // TODO: remove
});
