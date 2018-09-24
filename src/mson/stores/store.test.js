import Store from './store';

it('should build doc', () => {
  const store = new Store();
  const fieldValues = {
    firstName: 'Ron',
    lastName: 'Weasley'
  };
  const userId = '1';

  let doc = store._buildDoc({ fieldValues, userId });
  expect(doc).toEqual({
    id: doc.id,
    archivedAt: null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId,
    fieldValues
  });

  // When userId is null
  doc = store._buildDoc({ fieldValues, id: '1', userId: null });
  expect(doc.userId).toBeNull();
  expect(doc.id).toEqual('1');
});
