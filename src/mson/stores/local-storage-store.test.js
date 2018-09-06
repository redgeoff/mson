import LocalStorageStore from './local-storage-store';
import { shouldCRUD, shouldGetAll } from './memory-store.test';

it('should CRUD', () =>
  shouldCRUD(LocalStorageStore, { storeName: 'local-storage-store-crud' }));

it('should get all', () =>
  shouldGetAll(LocalStorageStore, {
    storeName: 'local-storage-store-get-all'
  }));
