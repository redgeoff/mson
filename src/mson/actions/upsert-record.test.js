import UpsertRecord from './upsert-record';
import compiler from '../compiler';

it('should upsert record', async () => {
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

  const storeName = 'MyStore';

  const upsertRecord = new UpsertRecord({ storeName });

  // Mock
  let roles = [];
  upsertRecord._access._registrar = {
    client: {
      user: {
        getSession: () => ({
          user: {
            roles
          }
        })
      }
    }
  };
  upsertRecord._registrar = {
    client: {
      record: {
        create: () => {},
        update: () => {}
      }
    }
  };
  upsertRecord._globals = {
    get: () => 'appId'
  };

  const createSpy = jest.spyOn(upsertRecord._registrar.client.record, 'create');
  const updateSpy = jest.spyOn(upsertRecord._registrar.client.record, 'update');

  // Create
  await upsertRecord.act({
    component: form
  });
  expect(createSpy).toHaveBeenCalledWith({
    appId: 'appId',
    componentName: storeName,
    fieldValues
  });

  // Update
  const id = 1;
  form.setValues({ id }); // TODO: this should be set via the results of the creation
  await upsertRecord.act({
    component: form
  });
  expect(updateSpy).toHaveBeenCalledWith({
    appId: 'appId',
    componentName: storeName,
    id,
    fieldValues: Object.assign({ id }, fieldValues)
  });
});
