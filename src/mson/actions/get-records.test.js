import GetRecords from './get-records';

it('should get records', async () => {
  const storeName = 'MyStore';
  const where = {
    id: 1
  };

  const getRecords = new GetRecords({ storeName, where });

  const records = [
    {
      firstName: 'Aretha',
      lastName: 'Franklin'
    },
    {
      firstName: 'Tom',
      lastName: 'Petty'
    }
  ];

  // Mock
  getRecords._registrar = {
    client: {
      record: {
        getAll: () => ({
          data: {
            records
          }
        })
      }
    }
  };
  getRecords._globals = {
    get: () => 'appId'
  };

  const getAllSpy = jest.spyOn(getRecords._registrar.client.record, 'getAll');

  const values = await getRecords.act();
  expect(values).toEqual(records);

  expect(getAllSpy).toHaveBeenCalledWith({
    appId: 'appId',
    componentName: storeName,
    asArray: true,
    where
  });
});
