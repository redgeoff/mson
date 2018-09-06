import LocalStorageStore from './local-storage-store';
import { shouldCRUD, shouldGetAll, createForm } from './memory-store.test';

it('should CRUD', () =>
  shouldCRUD(LocalStorageStore, { storeName: 'local-storage-store-crud' }));

it('should get all', () =>
  shouldGetAll(LocalStorageStore, {
    storeName: 'local-storage-store-get-all'
  }));

it('should loads items when store exists', async () => {
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
  const ella = await store1.createItem({ form });

  const store2 = new LocalStorageStore({
    storeName: 'local-storage-store-exists'
  });
  const item = await store2.getItem({ id: ella.id });
  expect(item).toEqual(ella);
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
