import CreateDoc from './create-doc';
import compiler from '../compiler';
import MemoryStore from '../stores/memory-store';

it('should create doc', async () => {
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

  const createDoc = new CreateDoc({ store });

  const createSpy = jest.spyOn(store, 'createDoc');

  await createDoc.act({
    component: form
  });

  expect(createSpy).toHaveBeenCalledWith({ form });
});
