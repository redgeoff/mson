import MemoryStore from './memory-store';
import { shouldCRUD, shouldGetAll, shouldMove } from './store-test';

it('should create, update, archive & restore', async () => {
  await shouldCRUD(MemoryStore);
});

it('should get all', async () => {
  await shouldGetAll(MemoryStore);
});

it('should move', async () => {
  await shouldMove(MemoryStore);
});
