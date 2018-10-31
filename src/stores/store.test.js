import Store from './store';
import { Reorder } from './reorder';

it('should build doc', () => {
  const store = new Store();
  const fieldValues = {
    firstName: 'Ron',
    lastName: 'Weasley'
  };
  const userId = '1';

  let doc = store._buildDoc({ fieldValues, userId });
  expect(doc).toEqual({
    id: doc.id,
    archivedAt: null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId,
    fieldValues
  });

  // When userId is null
  doc = store._buildDoc({ fieldValues, id: '1', userId: null });
  expect(doc.userId).toBeNull();
  expect(doc.id).toEqual('1');
});

it('should set order to default when setting doc', () => {
  const store = new Store();
  const doc = { order: 1 };
  store._setDoc({ doc, order: undefined });
  expect(doc.order).toEqual(Reorder.DEFAULT_ORDER);
});

it('should get the user id', () => {
  const store = new Store();
  expect(store._getUserId()).toBeUndefined();

  let session = null;
  store._registrar = {
    client: {
      user: {
        getSession: () => session
      }
    }
  };

  expect(store._getUserId()).toBeUndefined();

  session = {
    user: {
      id: 'my-id'
    }
  };
  expect(store._getUserId()).toEqual('my-id');
});
