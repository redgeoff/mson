import GetRecord from './get-record';

it('should get record', async () => {
  const storeName = 'MyStore';
  const where = {
    id: 1
  };

  const getRecord = new GetRecord({ storeName, where });

  const fieldValues = {
    firstName: 'Aretha',
    lastName: 'Franklin'
  };

  // Mock
  getRecord._registrar = {
    client: {
      record: {
        get: () => ({
          data: {
            record: fieldValues
          }
        })
      }
    }
  };
  getRecord._globals = {
    get: () => 'appId'
  };

  const getSpy = jest.spyOn(getRecord._registrar.client.record, 'get');

  const values = await getRecord.act();
  expect(values).toEqual(fieldValues);

  expect(getSpy).toHaveBeenCalledWith({
    appId: 'appId',
    componentName: storeName,
    where
  });
});
