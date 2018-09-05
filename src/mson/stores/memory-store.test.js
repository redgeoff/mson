import MemoryStore from './memory-store';
import Form from '../form';
import { TextField } from '../fields';

const createForm = props => {
  return new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ],
    ...props
  });
};

it('should create, update, archive & restore', async () => {
  let fieldValues = {
    firstName: 'Ella',
    lastName: 'Fitzgerald'
  };

  const form = createForm({
    value: fieldValues
  });

  const store = new MemoryStore();

  const created = await store.create({ form });
  expect(created.id).not.toBeFalsy();
  expect(created.archivedAt).toBeNull();
  expect(created.fieldValues).toEqual(
    Object.assign({ id: created.id }, fieldValues)
  );

  expect(await store.getItem({ id: created.id })).toEqual(created);

  form.setValues({
    id: created.id,
    firstName: 'F. Scott'
  });

  const updated = await store.update({ id: created.id, form });
  expect(updated).toEqual({
    id: created.id,
    archivedAt: null,
    fieldValues: {
      id: created.id,
      firstName: 'F. Scott',
      lastName: 'Fitzgerald'
    }
  });

  expect(await store.getItem({ id: created.id })).toEqual(updated);

  const archived = await store.archive({ id: created.id });
  expect(archived).toEqual(
    Object.assign({}, updated, { archivedAt: archived.archivedAt })
  );
  expect(archived.archivedAt).not.toBeFalsy();

  const restored = await store.restore({ id: created.id });
  expect(restored).toEqual(updated);
  expect(archived.archivedAt).toBeNull();
});

const createItem = async (store, fieldValues) => {
  const form = createForm({ value: fieldValues });
  return store.create({ form });
};

it('should get all', async () => {
  const store = new MemoryStore();

  const harryValues = {
    firstName: 'Harry',
    lastName: 'Potter'
  };
  const harry = await createItem(store, harryValues);

  const hermioneValues = {
    firstName: 'Hermione',
    lastName: 'Granger'
  };
  const hermione = await createItem(store, hermioneValues);
  await store.archive({ id: hermione.id });

  const ronValues = {
    firstName: 'Ron',
    lastName: 'Weasley'
  };
  const ron = await createItem(store, ronValues);

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

  // Default props
  expect(await store.getAll({})).toEqual(all);

  // Search
  expect(
    await store.getAll({
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
    await store.getAll({
      showArchived: true
    })
  ).toEqual(Object.assign({}, all, { edges: [{ node: hermione }] }));
  expect(
    await store.getAll({
      showArchived: false
    })
  ).toEqual(
    Object.assign({}, all, { edges: [{ node: harry }, { node: ron }] })
  );

  // Order
  expect(
    await store.getAll({
      order: [['fieldValues.firstName', 'DESC']]
    })
  ).toEqual(
    Object.assign({}, all, {
      edges: [{ node: ron }, { node: hermione }, { node: harry }]
    })
  );
});
