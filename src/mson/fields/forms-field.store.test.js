import FormsField from './forms-field';
import MemoryStore from '../stores/memory-store';
import Form from '../form';
import TextField from '../fields/text-field';

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

it('should listen to store changes', () => {
  const store = new MemoryStore();
  const form = new Form({
    fields: [new TextField({ name: 'firstName' })]
  });
  const field = new FormsField({ showArchived: false, store, form });
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
  field._handleStoreChangeFactory()('otherEvent', null);
  expect(upsertFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Create fails as archivedAt does not match
  field.set({ showArchived: true });
  field._handleStoreChangeFactory()('createItem', value);
  expect(upsertFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);
  field.set({ showArchived: false });

  const muteChange = false;

  // Create
  field._handleStoreChangeFactory()('createItem', value);
  expect(upsertFormSpy).toHaveBeenCalledWith(
    value.value.fieldValues,
    value.value.archivedAt,
    value.value.userId,
    muteChange,
    value.value.cursor
  );

  // Update
  field._handleStoreChangeFactory()('updateItem', value);
  expect(upsertFormSpy).toHaveBeenCalledWith(
    value.value.fieldValues,
    value.value.archivedAt,
    value.value.userId,
    muteChange,
    value.value.cursor
  );

  // Update leads to delete as archivedAt changing
  value.value.archivedAt = new Date();
  field._handleStoreChangeFactory()('updateItem', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
  value.value.archivedAt = null;

  // Prepare for deleteItem by creating again
  field._handleStoreChangeFactory()('createItem', value);
  removeFormSpy.mockReset();

  // Delete fails as item not found
  field._handleStoreChangeFactory()('deleteItem', {
    value: { value: { id: 'missing id' } }
  });
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Delete
  field._handleStoreChangeFactory()('deleteItem', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
});
