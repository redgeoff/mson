import Form from '../form';
import { TextField } from '../fields';
import testUtils from '../test-utils';
import { Reorder } from './reorder';

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

  // Create
  const created = await store.createDoc({ form });
  expect(created.id).not.toBeFalsy();
  expect(created.archivedAt).toBeNull();
  expect(created.createdAt).not.toBeFalsy();
  expect(created.updatedAt).not.toBeFalsy();
  expect(created.fieldValues).toEqual(fieldValues);
  expect(created.order).toEqual(Reorder.DEFAULT_ORDER);

  // Get
  expect(await store.getDoc({ id: created.id })).toEqual(created);

  // Get when empty
  expect(await store.getDoc({ where: { id: 'missingId' } })).toBeNull();

  form.setValues({
    id: created.id,
    firstName: 'F. Scott'
  });

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  // Update
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
    },
    order: Reorder.DEFAULT_ORDER
  });
  expect(updated.updatedAt).not.toEqual(created.updatedAt);

  expect(await store.getDoc({ id: created.id })).toEqual(updated);

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  // Archive
  const archived = await store.archiveDoc({ id: created.id });
  expect(archived).toEqual(
    Object.assign({}, updated, {
      archivedAt: archived.archivedAt,
      updatedAt: archived.updatedAt,
      order: Reorder.DEFAULT_ORDER
    })
  );
  expect(archived.archivedAt).not.toBeFalsy();
  expect(archived.updatedAt).not.toEqual(updated.updatedAt);

  // Make sure timestamps aren't the same
  await testUtils.sleepToEnsureDifferentTimestamps();

  // Restore
  const restored = await store.restoreDoc({ id: created.id });
  expect(restored).toEqual(
    Object.assign({}, updated, {
      updatedAt: restored.updatedAt,
      order: Reorder.DEFAULT_ORDER
    })
  );
  expect(restored.archivedAt).toBeNull();
  expect(restored.updatedAt).not.toEqual(archived.updatedAt);
};

export const createDoc = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.createDoc({ form, reorder: true });
};

const createDocs = async store => {
  const harryValues = {
    firstName: 'Harry',
    lastName: 'Potter',
    order: 0
  };
  const harry = await createDoc(store, harryValues);

  const hermioneValues = {
    firstName: 'Hermione',
    lastName: 'Granger',
    order: 1
  };
  let hermione = await createDoc(store, hermioneValues);
  hermione = await store.archiveDoc({ id: hermione.id });

  const ronValues = {
    firstName: 'Ron',
    lastName: 'Weasley'
  };
  const ron = await createDoc(store, ronValues);

  return { harry, hermione, ron };
};

export const updateDoc = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.updateDoc({ form, reorder: true });
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

const expectDocsToEqual = (docs, items) => {
  const edges = [];
  items.forEach(item => {
    edges.push({
      node: {
        fieldValues: {
          firstName: item.firstName
        },
        order: item.order
      }
    });
  });

  expect(docs).toMatchObject({ edges });
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
    order: 1
  };
  const ginny = await createDoc(store, ginnyValues);
  expectDocsToEqual(await store.getAllDocs(searchDefaults), [
    {
      firstName: 'Harry',
      order: 0
    },
    {
      firstName: 'Ginny',
      order: 1
    },
    {
      firstName: 'Ron',
      order: 2
    },
    {
      firstName: 'Hermione',
      order: Reorder.DEFAULT_ORDER
    }
  ]);

  // Move up
  ron = await updateDoc(
    store,
    Object.assign({}, ron.fieldValues, { id: ron.id, order: 0 })
  );
  expectDocsToEqual(await store.getAllDocs(searchDefaults), [
    {
      firstName: 'Ron',
      order: 0
    },
    {
      firstName: 'Harry',
      order: 1
    },
    {
      firstName: 'Ginny',
      order: 2
    },
    {
      firstName: 'Hermione',
      order: Reorder.DEFAULT_ORDER
    }
  ]);

  // Move to end of ordered list
  harry = await updateDoc(
    store,
    Object.assign({}, harry.fieldValues, { id: harry.id, order: 2 })
  );
  expectDocsToEqual(await store.getAllDocs(searchDefaults), [
    {
      firstName: 'Ron',
      order: 0
    },
    {
      firstName: 'Ginny',
      order: 1
    },
    {
      firstName: 'Harry',
      order: 2
    },
    {
      firstName: 'Hermione',
      order: Reorder.DEFAULT_ORDER
    }
  ]);

  // Archive
  await store.archiveDoc({ id: ginny.id, reorder: true });
  expectDocsToEqual(await store.getAllDocs(searchDefaults), [
    {
      firstName: 'Ron',
      order: 0
    },
    {
      firstName: 'Harry',
      order: 1
    },
    {
      firstName: 'Hermione',
      order: Reorder.DEFAULT_ORDER
    },
    {
      firstName: 'Ginny',
      order: Reorder.DEFAULT_ORDER
    }
  ]);

  // Restore
  await store.restoreDoc({ id: ginny.id, reorder: true });
  expectDocsToEqual(await store.getAllDocs(searchDefaults), [
    {
      firstName: 'Ron',
      order: 0
    },
    {
      firstName: 'Harry',
      order: 1
    },
    {
      firstName: 'Ginny',
      order: 2
    },
    {
      firstName: 'Hermione',
      order: Reorder.DEFAULT_ORDER
    }
  ]);
};
