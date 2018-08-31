import DocStore from './doc-store';

it('should set, get and all', async () => {
  const docs = new DocStore();

  let changes = [];

  docs.on('change', change => {
    changes.push(change);
  });

  expect(await docs.has(1)).toEqual(false);
  await docs.set({ id: 1, foo: 'one' });
  expect(await docs.has(1)).toEqual(true);
  const doc2 = await docs.set({ foo: 'two' });
  await docs.set({ id: 3, foo: 'three' });

  const expDocs = [
    { id: 1, foo: 'one' },
    { id: doc2.id, foo: 'two' },
    { id: 3, foo: 'three' }
  ];

  expect(changes).toEqual([
    {
      event: 'create',
      doc: expDocs[0],
      nextId: null,
      oldDoc: undefined,
      oldNextId: undefined
    },
    {
      event: 'create',
      doc: expDocs[1],
      nextId: null,
      oldDoc: undefined,
      oldNextId: undefined
    },
    {
      event: 'create',
      doc: expDocs[2],
      nextId: null,
      oldDoc: undefined,
      oldNextId: undefined
    }
  ]);

  expect(await docs.get(1)).toEqual(expDocs[0]);
  expect(await docs.get(doc2.id)).toEqual(expDocs[1]);
  expect(await docs.get(3)).toEqual(expDocs[2]);

  let allDocs = [];
  for (const doc of docs.all()) {
    allDocs.push(doc);
  }
  expect(allDocs).toEqual(expDocs);

  expect(docs.numTotalDocs()).toEqual(3);
});

it('set should not mutate parameter', async () => {
  const docs = new DocStore();
  let doc = { foo: 'bar' };
  const newDoc = await docs.set(doc);
  expect(newDoc).toEqual({ id: newDoc.id, foo: 'bar' });
  expect(doc).toEqual({ foo: 'bar' });
});

it('should delete', async () => {
  const docs = new DocStore();

  await docs.set({ id: 1, foo: 'one' });
  const doc2 = await docs.set({ foo: 'two' });
  await docs.set({ id: 3, foo: 'three' });

  let changes = [];

  docs.on('change', change => {
    changes.push(change);
  });

  await docs.delete(doc2.id);
  await docs.delete(1);

  expect(changes).toEqual([
    {
      event: 'delete',
      doc: undefined,
      nextId: undefined,
      oldDoc: { id: doc2.id, foo: 'two' },
      oldNextId: 3
    },
    {
      event: 'delete',
      doc: undefined,
      nextId: undefined,
      oldDoc: { id: 1, foo: 'one' },
      oldNextId: 3
    }
  ]);

  let allDocs = [];
  for (const doc of docs.all()) {
    allDocs.push(doc);
  }
  expect(allDocs).toEqual([{ id: 3, foo: 'three' }]);
});

it('should update', async () => {
  const docs = new DocStore();

  await docs.set({ id: 1, foo: 'one' });
  await docs.set({ id: 2, foo: 'two' });
  await docs.set({ id: 3, foo: 'three' });

  let changes = [];

  docs.on('change', change => {
    changes.push(change);
  });

  docs.set({ id: 2, foo: 'two modified' });

  expect(changes).toEqual([
    {
      event: 'update',
      doc: { id: 2, foo: 'two modified' },
      nextId: 3,
      oldDoc: { id: 2, foo: 'two' },
      oldNextId: 3
    }
  ]);

  const expDocs = [
    { id: 1, foo: 'one' },
    { id: 2, foo: 'two modified' },
    { id: 3, foo: 'three' }
  ];

  let allDocs = [];
  for (const doc of docs.all()) {
    allDocs.push(doc);
  }
  expect(allDocs).toEqual(expDocs);
});

it('should move', async () => {
  const docs = new DocStore();

  await docs.set({ id: 1, foo: 'one' });
  await docs.set({ id: 2, foo: 'two' });
  await docs.set({ id: 3, foo: 'three' });

  let changes = [];

  docs.on('change', change => {
    changes.push(change);
  });

  // Move two before one
  docs.set({ id: 2, foo: 'two' }, 1);

  expect(changes).toEqual([
    {
      event: 'update',
      doc: { id: 2, foo: 'two' },
      nextId: undefined,
      oldDoc: { id: 2, foo: 'two' },
      oldNextId: 3
    }
  ]);

  const expDocs = [
    { id: 2, foo: 'two' },
    { id: 1, foo: 'one' },
    { id: 3, foo: 'three' }
  ];

  let allDocs = [];
  for (const doc of docs.all()) {
    allDocs.push(doc);
  }
  expect(allDocs).toEqual(expDocs);
});
