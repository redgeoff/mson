import FormsField from './forms-field';
import MemoryStore from '../stores/memory-store';
import Form from '../form';
import TextField from '../fields/text-field';
import Factory from '../component/factory';

it('should set store', () => {
  const store1 = new MemoryStore();
  const removeAllListenersSpy1 = jest.spyOn(store1, 'removeAllListeners');
  const onSpy1 = jest.spyOn(store1, 'on');

  const store2 = new MemoryStore();
  const removeAllListenersSpy2 = jest.spyOn(store2, 'removeAllListeners');
  const onSpy2 = jest.spyOn(store2, 'on');

  // Initialize
  const field = new FormsField({ store: store1 });
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
  const field = new FormsField({ showArchived: false, store, formFactory });
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
      cursor: 'cursor'
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
    values: value.value.fieldValues,
    archivedAt: value.value.archivedAt,
    userId: value.value.userId,
    muteChange,
    cursor: value.value.cursor
  });

  // Update
  await field._handleStoreChangeFactory()('updateDoc', value);
  expect(upsertFormSpy).toHaveBeenCalledWith({
    values: value.value.fieldValues,
    archivedAt: value.value.archivedAt,
    userId: value.value.userId,
    muteChange,
    cursor: value.value.cursor
  });

  // Update leads to delete as archivedAt changing
  value.value.archivedAt = new Date();
  await field._handleStoreChangeFactory()('updateDoc', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
  value.value.archivedAt = null;

  // Prepare for deleteItem by creating again
  await field._handleStoreChangeFactory()('createDoc', value);
  removeFormSpy.mockReset();

  // Delete fails as item not found
  await field._handleStoreChangeFactory()('deleteItem', {
    value: { value: { id: 'missing id' } }
  });
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Delete
  await field._handleStoreChangeFactory()('deleteItem', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
});
