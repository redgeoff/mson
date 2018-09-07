import FormsField from './forms-field';
import Store from '../stores/store';

it('should set store', () => {
  const store1 = new Store();
  const removeAllListenersSpy1 = jest.spyOn(store1, 'removeAllListeners');
  const onSpy1 = jest.spyOn(store1, 'on');

  const store2 = new Store();
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
  const field = new FormsField({ showArchived: false });
  const addFormSpy = jest.spyOn(field, 'addForm').mockImplementation();
  const updateFormSpy = jest.spyOn(field, 'updateForm').mockImplementation();
  const removeFormSpy = jest.spyOn(field, 'removeForm').mockImplementation();

  const value = {
    value: {
      id: '1',
      fieldValues: {},
      archivedAt: null,
      userId: '1',
      cursor: 'cursor'
    }
  };

  // Ignore other events
  field._handleStoreChangeFactory()('otherEvent', null);
  expect(addFormSpy).toHaveBeenCalledTimes(0);
  expect(updateFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);

  // Verify showArchived is checked
  field.set({ showArchived: true });
  field._handleStoreChangeFactory()('createItem', value);
  expect(addFormSpy).toHaveBeenCalledTimes(0);
  expect(updateFormSpy).toHaveBeenCalledTimes(0);
  expect(removeFormSpy).toHaveBeenCalledTimes(0);
  field.set({ showArchived: false });

  const muteChange = false;

  field._handleStoreChangeFactory()('createItem', value);
  expect(addFormSpy).toHaveBeenCalledWith(
    value.value.fieldValues,
    value.value.archivedAt,
    value.value.userId,
    muteChange,
    value.value.cursor
  );

  field._handleStoreChangeFactory()('updateItem', value);
  expect(updateFormSpy).toHaveBeenCalledWith(
    value.value.fieldValues,
    value.value.archivedAt,
    value.value.userId,
    muteChange,
    value.value.cursor
  );

  field._handleStoreChangeFactory()('deleteItem', value);
  expect(removeFormSpy).toHaveBeenCalledWith(value.value.id, muteChange);
});
