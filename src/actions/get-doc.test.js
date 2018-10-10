import GetDoc from './get-doc';
import MemoryStore from '../stores/memory-store';
import Form from '../form';
import TextField from '../fields/text-field';

it('should get doc', async () => {
  const store = new MemoryStore();

  const form = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ]
  });

  const where = {
    id: 'aretha'
  };

  const doc = {
    id: 'aretha',
    firstName: 'Aretha',
    lastName: 'Franklin'
  };

  // Mock data
  form.setValues(doc);
  const createdDoc = await store.createDoc({ form });

  const getDoc = new GetDoc({ store, where });

  const getDocsSpy = jest.spyOn(store, 'getDoc');

  const values = await getDoc.act();
  expect(values).toEqual(createdDoc);

  expect(getDocsSpy).toHaveBeenCalledWith({
    where
  });
});
