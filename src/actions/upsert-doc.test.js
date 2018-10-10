import UpsertDoc from './upsert-doc';
import compiler from '../compiler';
import MemoryStore from '../stores/memory-store';

it('should upsert doc', async () => {
  const form = compiler.newComponent({
    component: 'Form',
    fields: [
      {
        component: 'TextField',
        name: 'firstName'
      },
      {
        component: 'TextField',
        name: 'lastName'
      }
    ]
  });

  const fieldValues = {
    firstName: 'Aretha',
    lastName: 'Franklin'
  };

  form.setValues(fieldValues);

  const store = new MemoryStore();

  const upsertDoc = new UpsertDoc({ store });

  const createSpy = jest.spyOn(store, 'createDoc');
  const updateSpy = jest.spyOn(store, 'updateDoc');

  // Create
  const createdDoc = await upsertDoc.act({
    component: form
  });
  expect(createSpy).toHaveBeenCalledWith({
    form
  });

  // Update
  const id = createdDoc.id;
  form.setValues({ id });
  await upsertDoc.act({
    component: form
  });
  expect(updateSpy).toHaveBeenCalledWith({
    id,
    form
  });
});
