import MemoryStore from './memory-store';
import Form from '../form';
import { TextField } from '../fields';
import testUtils from '../test-utils';

export const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ],
    ...props
  });
};

export const shouldCRUD = async (Store, props) => {
  let fieldValues = {
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  };

  const form = createForm({
    value: fieldValues
  });

  const store = new Store(props);

  const created = await store.createDoc({ form });
  expect(created.id).not.toBeFalsy();
  expect(created.archivedAt).toBeNull();
  expect(created.createdAt).not.toBeFalsy();
  expect(created.updatedAt).not.toBeFalsy();
  expect(created.fieldValues).toEqual(
    Object.assign({ id: created.id }, fieldValues)
  );

  expect(await store.getDoc({ id: created.id })).toEqual(created);

  form.setValues({
    id: created.id,
    firstName: 'F. Scott'
  });

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  const updated = await store.updateDoc({ id: created.id, form });
  expect(updated).toEqual({
    id: created.id,
    archivedAt: null,
    createdAt: created.createdAt,
    updatedAt: updated.updatedAt,
    userId: null,
    fieldValues: {
      id: created.id,
      firstName: 'F. Scott',
      lastName: 'Fitzgerald'
    }
  });
  expect(updated.updatedAt).not.toEqual(created.updatedAt);

  expect(await store.getDoc({ id: created.id })).toEqual(updated);

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  const archived = await store.archiveDoc({ id: created.id });
  expect(archived).toEqual(
    Object.assign({}, updated, {
      archivedAt: archived.archivedAt,
      updatedAt: archived.updatedAt
    })
  );
  expect(archived.archivedAt).not.toBeFalsy();
  expect(archived.updatedAt).not.toEqual(updated.updatedAt);

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  const restored = await store.restoreDoc({ id: created.id });
  expect(restored).toEqual(
    Object.assign({}, updated, { updatedAt: restored.updatedAt })
  );
  expect(restored.archivedAt).toBeNull();
  expect(restored.updatedAt).not.toEqual(archived.updatedAt);
};

it('should create, update, archive & restore', async () => {
  await shouldCRUD(MemoryStore);
});

const createDoc = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.createDoc({ form });
};

export const shouldGetAll = async (Store, props) => {
  const store = new Store(props);

  const harryValues = {
    firstName: 'Harry',
    lastName: 'Potter'
  };
  const harry = await createDoc(store, harryValues);

  const hermioneValues = {
    firstName: 'Hermione',
    lastName: 'Granger'
  };
  let hermione = await createDoc(store, hermioneValues);
  hermione = await store.archiveDoc({ id: hermione.id });

  const ronValues = {
    firstName: 'Ron',
    lastName: 'Weasley'
  };
  const ron = await createDoc(store, ronValues);

  const all = {
    pageInfo: {
      hasNextPage: false
    },
    edges: [
      {
        node: harry
      },
      {
        node: hermione
      },
      {
        node: ron
      }
    ]
  };

  const searchDefaults = {
    after: null,
    before: null,
    first: null,
    order: null,
    showArchived: null
  };

  // Default props
  expect(
    await store.getAllDocs({ ...searchDefaults, showArchived: null })
  ).toEqual(all);

  // Search
  expect(
    await store.getAllDocs({
      ...searchDefaults,
      where: {
        $and: [
          {
            $or: [
              { 'fieldValues.firstName': { $iLike: 'h%' } },
              { 'fieldValues.lastName': { $iLike: 'h%' } }
            ]
          }
        ]
      }
    })
  ).toEqual(
    Object.assign({}, all, { edges: [{ node: harry }, { node: hermione }] })
  );

  // Archived status
  expect(
    await store.getAllDocs({
      ...searchDefaults,
      showArchived: true
    })
  ).toEqual(Object.assign({}, all, { edges: [{ node: hermione }] }));
  expect(
    await store.getAllDocs({
      ...searchDefaults,
      showArchived: false
    })
  ).toEqual(
    Object.assign({}, all, { edges: [{ node: harry }, { node: ron }] })
  );

  // Order
  expect(
    await store.getAllDocs({
      ...searchDefaults,
      order: [['fieldValues.firstName', 'DESC']]
    })
  ).toEqual(
    Object.assign({}, all, {
      edges: [{ node: ron }, { node: hermione }, { node: harry }]
    })
  );
};

it('should get all', async () => {
  await shouldGetAll(MemoryStore);
});
