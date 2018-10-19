import LocalStorageStore from './local-storage-store';
import { shouldCRUD, shouldGetAll, createForm, shouldMove } from './store-test';

it('should CRUD', () =>
  shouldCRUD(LocalStorageStore, { storeName: 'local-storage-store-crud' }));

it('should get all', () =>
  shouldGetAll(LocalStorageStore, {
    storeName: 'local-storage-store-get-all'
  }));

it('should move', () =>
  shouldMove(LocalStorageStore, {
    storeName: 'local-storage-store-move'
  }));

it('should loads docs when store exists', async () => {
  let fieldValues = {
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  };

  const form = createForm({
    value: fieldValues
  });

  const store1 = new LocalStorageStore({
    storeName: 'local-storage-store-exists'
  });
  const ella = await store1.createDoc({ form });

  const store2 = new LocalStorageStore({
    storeName: 'local-storage-store-exists'
  });
  const doc = await store2.getDoc({ id: ella.id });
  // Use JSON.parse and JSON.stringify as the store converts dates to strings in this manner
  const ellaConverted = JSON.parse(JSON.stringify(ella));
  expect(doc).toEqual(ellaConverted);
});

it('should get local storage', () => {
  const store = new LocalStorageStore();

  const storage1 = store._getLocalStorage();

  const localStorage = {};

  // Mock
  store._global = {
    window: {
      localStorage
    }
  };

  const storage2 = store._getLocalStorage();
  expect(storage2).toEqual(localStorage);
  expect(storage2).not.toEqual(storage1);
});
