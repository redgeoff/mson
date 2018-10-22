import StoreMapa from './store-mapa';

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
