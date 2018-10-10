import Iterator from './iterator';

it('should iterate', async () => {
  const iterator = new Iterator({
    iterator: 'arguments.items',
    return: {
      id: '{{item.id}}',
      name: '{{item.firstName}} {{item.lastName}}'
    }
  });

  const result = await iterator.act({
    arguments: {
      items: [
        {
          id: '1',
          firstName: 'Ella',
          lastName: 'Fitzgerald'
        },
        {
          id: '2',
          firstName: 'Johnny',
          lastName: 'Cash'
        }
      ]
    }
  });

  expect(result).toEqual([
    {
      id: '1',
      name: 'Ella Fitzgerald'
    },
    {
      id: '2',
      name: 'Johnny Cash'
    }
  ]);
});
