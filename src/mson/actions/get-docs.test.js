import GetDocs from './get-docs';
import MemoryStore from '../stores/memory-store';
import Form from '../form';
import TextField from '../fields/text-field';

it('should get docs', async () => {
  const store = new MemoryStore();

  const form = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ]
  });

  const where = {
    $or: [
      {
        id: 'aretha'
      },
      {
        id: 'tom'
      }
    ]
  };

  const docs = [
    {
      id: 'aretha',
      firstName: 'Aretha',
      lastName: 'Franklin'
    },
    {
      id: 'tom',
      firstName: 'Tom',
      lastName: 'Petty'
    }
  ];

  const createdDocs = [];

  // Mock data
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    form.setValues(doc);
    const createdDoc = await store.createDoc({ form });
    createdDocs.push(createdDoc);
  }

  const getDocs = new GetDocs({ store, where });

  const getAllDocsSpy = jest.spyOn(store, 'getAllDocs');

  const values = await getDocs.act();
  expect(values.edges).toEqual([
    {
      node: createdDocs[0]
    },
    {
      node: createdDocs[1]
    }
  ]);

  expect(getAllDocsSpy).toHaveBeenCalledWith({
    where
  });
});
