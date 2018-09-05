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

it('should get all', () => {
  // TODO: blank props, i.e. await store.getAll({})
});
