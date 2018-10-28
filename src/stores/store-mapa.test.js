import StoreMapa from './store-mapa';
import { Reorder } from './reorder';

it('should create', () => {
  // No docs
  let mapa = new StoreMapa();
  mapa.set('b', { v: 'b', order: 1 });
  expect(mapa.map(doc => doc)).toEqual([{ v: 'b', order: 1 }]);

  // 1 doc: before first
  mapa = new StoreMapa();
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('a', { v: 'a', order: 0.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0.9 },
    { v: 'b', order: 1 }
  ]);

  // 1 doc: after first
  mapa = new StoreMapa();
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('a', { v: 'a', order: 2 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 1 },
    { v: 'a', order: 2 }
  ]);

  // 2 docs: after 1st
  mapa = new StoreMapa();
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 2 });
  mapa.set('a', { v: 'a', order: 1.1 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 1 },
    { v: 'a', order: 1.1 },
    { v: 'c', order: 2 }
  ]);
});

// TODO: create when archived docs

it('should move when 2 docs', () => {
  const createMapa = () => {
    const mapa = new StoreMapa();
    mapa.set('a', { v: 'a', order: 1 });
    mapa.set('b', { v: 'b', order: 2 });
    return mapa;
  };

  // Move to last
  let mapa = createMapa();
  mapa.set('a', { v: 'a', order: 2.1 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 2 },
    { v: 'a', order: 2.1 }
  ]);

  // Move to first
  mapa = createMapa();
  mapa.set('b', { v: 'b', order: 0.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 0.9 },
    { v: 'a', order: 1 }
  ]);
});

it('should move when 3 docs', () => {
  const createMapa = () => {
    const mapa = new StoreMapa();
    mapa.set('a', { v: 'a', order: 1 });
    mapa.set('b', { v: 'b', order: 2 });
    mapa.set('c', { v: 'c', order: 3 });
    return mapa;
  };

  // Move a before c
  let mapa = createMapa();
  mapa.set('a', { v: 'a', order: 2.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 2 },
    { v: 'a', order: 2.9 },
    { v: 'c', order: 3 }
  ]);

  // Move a to last
  mapa = createMapa();
  mapa.set('a', { v: 'a', order: 3.1 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 2 },
    { v: 'c', order: 3 },
    { v: 'a', order: 3.1 }
  ]);

  // Move b to last
  mapa = createMapa();
  mapa.set('b', { v: 'b', order: 3.1 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 1 },
    { v: 'c', order: 3 },
    { v: 'b', order: 3.1 }
  ]);

  // Move b before a
  mapa = createMapa();
  mapa.set('b', { v: 'b', order: 0.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 0.9 },
    { v: 'a', order: 1 },
    { v: 'c', order: 3 }
  ]);

  // Move c before a
  mapa = createMapa();
  mapa.set('c', { v: 'c', order: 0.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'c', order: 0.9 },
    { v: 'a', order: 1 },
    { v: 'b', order: 2 }
  ]);

  // Move c before b
  mapa = createMapa();
  mapa.set('c', { v: 'c', order: 1.9 });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 1 },
    { v: 'c', order: 1.9 },
    { v: 'b', order: 2 }
  ]);
});

it('should archive', () => {
  const archivedAt = new Date();

  // 1 doc
  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 1 });
  mapa.set('a', { v: 'a', archivedAt, order: null });
  expect(mapa.map(doc => doc)).toEqual([{ v: 'a', archivedAt, order: null }]);

  // 2 docs: archive 1st
  mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 1 });
  mapa.set('b', { v: 'b', order: 2 });
  mapa.set('a', { v: 'a', archivedAt, order: null });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'b', order: 2 },
    { v: 'a', archivedAt, order: null }
  ]);

  // 2 docs: archive 2nd
  mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 1 });
  mapa.set('b', { v: 'b', order: 2 });
  mapa.set('b', { v: 'b', archivedAt, order: null });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 1 },
    { v: 'b', archivedAt, order: null }
  ]);

  // 3 docs: archive 2nd
  mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 1 });
  mapa.set('b', { v: 'b', order: 2 });
  mapa.set('c', { v: 'c', order: 3 });
  mapa.set('b', { v: 'b', archivedAt, order: null });
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 1 },
    { v: 'c', order: 3 },
    { v: 'b', archivedAt, order: null }
  ]);
});

// TODO: move when archived docs

it('should create and reorder', () => {
  const reorder = true;

  // Initial data
  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 }, undefined, undefined, reorder);
  mapa.set('b', { v: 'b', order: 1 }, undefined, undefined, reorder);
  mapa.set('c', { v: 'c', order: 2 }, undefined, undefined, reorder);

  // Insert
  mapa.set('d', { v: 'd', order: 1 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'd', order: 1 },
    { v: 'b', order: 2 },
    { v: 'c', order: 3 }
  ]);

  // Create when order is null
  mapa.set('e', { v: 'e', order: null }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'd', order: 1 },
    { v: 'b', order: 2 },
    { v: 'c', order: 3 },
    { v: 'e', order: null }
  ]);

  // Create when order is undefined
  mapa.set('f', { v: 'f' }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'd', order: 1 },
    { v: 'b', order: 2 },
    { v: 'c', order: 3 },
    { v: 'e', order: null },
    { v: 'f' }
  ]);
});

it('should create and reorder when duplicate orders', () => {
  const reorder = true;

  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 1 });
  mapa.set('d', { v: 'd', order: 2 });
  mapa.set('e', { v: 'e', order: 2 });
  mapa.set('f', { v: 'f', order: 2 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'b', order: 1 },
    { v: 'f', order: 2 },
    { v: 'c', order: 3 },
    { v: 'd', order: 4 },
    { v: 'e', order: 5 }
  ]);

  mapa.set('g', { v: 'g', order: 1 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'g', order: 1 },
    { v: 'b', order: 2 },
    { v: 'f', order: 3 },
    { v: 'c', order: 4 },
    { v: 'd', order: 5 },
    { v: 'e', order: 6 }
  ]);
});

it('should create and not reorder when order is not changing', () => {
  const reorder = true;

  const mapa = new StoreMapa();
  const createInDocsAndReorderSpy = jest.spyOn(mapa, '_createInDocsAndReorder');
  const reorderSpy = jest.spyOn(mapa, '_reorder');

  mapa.set(
    'a',
    { v: 'a', order: Reorder.DEFAULT_ORDER },
    undefined,
    undefined,
    reorder
  );
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: Reorder.DEFAULT_ORDER }
  ]);
  expect(createInDocsAndReorderSpy).toHaveBeenCalledTimes(1);
  expect(reorderSpy).toHaveBeenCalledTimes(0);

  mapa.set('b', { v: 'b' }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: Reorder.DEFAULT_ORDER },
    { v: 'b' }
  ]);
  expect(createInDocsAndReorderSpy).toHaveBeenCalledTimes(2);
  expect(reorderSpy).toHaveBeenCalledTimes(0);
});

it('should move up and reorder', () => {
  const reorder = true;

  // Initial data
  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 2 });
  mapa.set('d', { v: 'd', order: 3 });

  // Move up
  mapa.set('c', { v: 'c', order: 1 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'c', order: 1 },
    { v: 'b', order: 2 },
    { v: 'd', order: 3 }
  ]);
});

it('should move up and reorder when duplicate orders', () => {
  const reorder = true;

  // Move when duplicate orders
  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 1 });
  mapa.set('d', { v: 'd', order: 2 });
  mapa.set('e', { v: 'e', order: 2 });
  mapa.set('d', { v: 'd', order: 1 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'd', order: 1 },
    { v: 'b', order: 2 },
    { v: 'c', order: 3 },
    { v: 'e', order: 4 }
  ]);
});

it('should move down and reorder', () => {
  const reorder = true;

  // Initial data
  const mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 2 });
  mapa.set('d', { v: 'd', order: 3 });

  // Move down
  mapa.set('b', { v: 'b', order: 2 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'c', order: 1 },
    { v: 'b', order: 2 },
    { v: 'd', order: 3 }
  ]);
});

it('should move down and reorder when duplicate orders', () => {
  const reorder = true;

  // Initial data
  const mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 1 });
  mapa.set('d', { v: 'd', order: 2 });
  mapa.set('e', { v: 'e', order: 2 });

  // Move down
  mapa.set('b', { v: 'b', order: 2 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'c', order: 1 },
    { v: 'b', order: 2 },
    { v: 'd', order: 3 },
    { v: 'e', order: 4 }
  ]);
});

it('should update and not reorder when order is not changing', () => {
  const reorder = true;

  // Initial data
  const mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });

  // Update
  const updateInDocsAndReorderSpy = jest.spyOn(mapa, '_updateInDocsAndReorder');
  const reorderSpy = jest.spyOn(mapa, '_reorder');
  mapa.set('a', { v: 'a1', order: 0 }, undefined, undefined, reorder);
  expect(mapa.map(doc => doc)).toEqual([{ v: 'a1', order: 0 }]);
  expect(updateInDocsAndReorderSpy).toHaveBeenCalledTimes(1);
  expect(reorderSpy).toHaveBeenCalledTimes(0);
});

it('should reorder when archiving and restoring', () => {
  const reorder = true;

  // Initial data
  const mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 2 });

  // Archive
  const archivedAt = new Date();
  mapa.set(
    'b',
    { v: 'b', archivedAt, order: null },
    undefined,
    undefined,
    reorder
  );
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'c', order: 1 },
    { v: 'b', order: null, archivedAt }
  ]);

  // Restore
  mapa.set(
    'b',
    { v: 'b', archivedAt: null, order: 2 },
    undefined,
    undefined,
    reorder
  );
  expect(mapa.map(doc => doc)).toEqual([
    { v: 'a', order: 0 },
    { v: 'c', order: 1 },
    { v: 'b', order: 2, archivedAt: null }
  ]);
});

it('should get keys at indexes', () => {
  let mapa = new StoreMapa();
  mapa.set('a', { v: 'a', order: 0 });
  mapa.set('b', { v: 'b', order: 1 });
  mapa.set('c', { v: 'c', order: 2 });
  mapa.set('d', { v: 'd', order: 3 });

  expect(mapa.keysAtIndexes([1])).toEqual({
    1: 'b'
  });

  expect(mapa.keysAtIndexes([2, 1, 3, 4])).toEqual({
    2: 'c',
    1: 'b',
    3: 'd'
  });
});
