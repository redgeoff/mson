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
  expect(created.fieldValues).toEqual(fieldValues);

  expect(await store.getDoc({ id: created.id })).toEqual(created);

  // Get when empty
  expect(await store.getDoc({ where: { id: 'missingId' } })).toBeNull();

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
      updatedAt: archived.updatedAt,
      order: null
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

const createDoc = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.createDoc({ form });
};

const createDocs = async store => {
  const harryValues = {
    firstName: 'Harry',
    lastName: 'Potter',
    order: 1
  };
  const harry = await createDoc(store, harryValues);

  const hermioneValues = {
    firstName: 'Hermione',
    lastName: 'Granger',
    order: 2
  };
  let hermione = await createDoc(store, hermioneValues);
  hermione = await store.archiveDoc({ id: hermione.id });

  const ronValues = {
    firstName: 'Ron',
    lastName: 'Weasley',
    order: 3
  };
  const ron = await createDoc(store, ronValues);

  return { harry, hermione, ron };
};

const updateDoc = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.updateDoc({ form });
};

const searchDefaults = {
  after: null,
  before: null,
  first: null,
  order: null,
  showArchived: null
};

export const shouldGetAll = async (Store, props) => {
  const store = new Store(props);

  const { harry, hermione, ron } = await createDocs(store);

  const all = {
    pageInfo: {
      hasNextPage: false
    },
    edges: [
      {
        node: harry
      },
      {
        node: ron
      },
      {
        node: hermione
      }
    ]
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

export const shouldMove = async (Store, props) => {
  const store = new Store(props);

  let { harry, hermione, ron } = await createDocs(store);

  const all = {
    pageInfo: {
      hasNextPage: false
    },
    edges: [
      {
        node: harry
      },
      {
        node: ron
      },
      {
        node: hermione
      }
    ]
  };

  // Initial ordering
  expect(await store.getAllDocs(searchDefaults)).toEqual(all);

  // Create
  const ginnyValues = {
    firstName: 'Ginny',
    lastName: 'Weasley',
    order: 1.1
  };
  const ginny = await createDoc(store, ginnyValues);
  expect(await store.getAllDocs(searchDefaults)).toEqual(
    Object.assign({}, all, {
      edges: [
        {
          node: harry
        },
        {
          node: ginny
        },
        {
          node: ron
        },
        {
          node: hermione
        }
      ]
    })
  );

  // Move up
  ron = await updateDoc(
    store,
    Object.assign({}, ron.fieldValues, { id: ron.id, order: 0.9 })
  );
  expect(await store.getAllDocs(searchDefaults)).toEqual(
    Object.assign({}, all, {
      edges: [
        {
          node: ron
        },
        {
          node: harry
        },
        {
          node: ginny
        },
        {
          node: hermione
        }
      ]
    })
  );

  // Move to end of ordered list
  harry = await updateDoc(
    store,
    Object.assign({}, harry.fieldValues, { id: harry.id, order: 1.2 })
  );
  expect(await store.getAllDocs(searchDefaults)).toEqual(
    Object.assign({}, all, {
      edges: [
        {
          node: ron
        },
        {
          node: ginny
        },
        {
          node: harry
        },
        {
          node: hermione
        }
      ]
    })
  );

  // Archive
  const archivedGinny = await store.archiveDoc({ id: ginny.id });
  expect(await store.getAllDocs(searchDefaults)).toEqual(
    Object.assign({}, all, {
      edges: [
        {
          node: ron
        },
        {
          node: harry
        },
        {
          node: hermione
        },
        {
          node: archivedGinny
        }
      ]
    })
  );
};
