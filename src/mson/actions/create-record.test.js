import CreateRecord from './create-record';
import compiler from '../compiler';

it('should create record', async () => {
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

  const createRecord = new CreateRecord({ storeName: 'MyStore' });

  // Mock
  createRecord._registrar = {
    client: {
      record: {
        create: () => {}
      }
    }
  };
  createRecord._globals = {
    get: () => 'appId'
  };

  const createSpy = jest.spyOn(createRecord._registrar.client.record, 'create');

  await createRecord.act({
    component: form
  });

  expect(createSpy).toHaveBeenCalledWith({
    appId: 'appId',
    componentName: 'MyStore',
    fieldValues
  });
});
