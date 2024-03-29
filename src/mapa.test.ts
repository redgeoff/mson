import Mapa, { Key, Item, OnValue } from './mapa';

// Define a class that extends Mapa so that we can inspect the state of items. This is an
// anti-pattern, so in the future, we may choose to refactor our tests so that this inspection is no
// longer needed.
class TestMapa<V> extends Mapa<V> {
  getItem(key: Key) {
    return this._getItem(key);
  }

  // Needed so that we can satisfy TypeScript and maintain 100% test coverage
  setItem(key: Key, item: Item<V>) {
    this._setItem(key, item);
  }

  // Needed so that we can satisfy TypeScript and maintain 100% test coverage
  deleteItem(key: Key) {
    this._deleteItem(key);
  }
}

const createMapa = () => {
  const m = new TestMapa();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);
  return m;
};

it('should set and get', () => {
  const m = new TestMapa();

  const emitChangeSpy = jest.spyOn(m, 'emitChange');

  // Set 1st item
  m.set('a', 1);
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: null,
    prevKey: null,
    value: 1,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('a');
  expect(m.length()).toEqual(1);
  expect(m.map((value) => value)).toEqual([1]);
  expect(m.nextKey('a')).toEqual(null);
  expect(m.previousKey('a')).toEqual(null);
  expect(emitChangeSpy).toHaveBeenCalledTimes(1);
  expect(emitChangeSpy.mock.calls[0]).toEqual([
    'create',
    { key: 'a', nextKey: null, prevKey: null, value: 1 },
  ]);

  // Set 2nd item
  m.set('b', '2');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: 'a',
    value: '2',
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(2);
  expect(m.map((value) => value)).toEqual([1, '2']);
  expect(m.nextKey('a')).toEqual('b');
  expect(m.previousKey('b')).toEqual('a');

  // Set 3rd item
  m.set('c', { value: 3 });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'a',
    value: '2',
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: { value: 3 },
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(3);
  expect(m.map((value) => value)).toEqual([1, '2', { value: 3 }]);

  // Update 3rd item
  emitChangeSpy.mockReset();
  m.set('c', 'c');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'a',
    value: '2',
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: 'c',
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(3);
  expect(m.map((value) => value)).toEqual([1, '2', 'c']);
  expect(emitChangeSpy).toHaveBeenCalledTimes(1);
  expect(emitChangeSpy.mock.calls[0]).toEqual([
    'update',
    { key: 'c', nextKey: null, prevKey: 'b', value: 'c' },
  ]);
});

it('should delete', () => {
  const m = new TestMapa();

  // Single item
  m.set('a', 1);
  const emitChangeSpy = jest.spyOn(m, 'emitChange');
  m.delete('a');
  expect(m.getItem('a')).toBeUndefined();
  expect(m.has('a')).toEqual(false);
  expect(m.firstKey()).toEqual(null);
  expect(m.lastKey()).toEqual(null);
  expect(m.length()).toEqual(0);
  expect(m.map((value) => value)).toEqual([]);
  expect(emitChangeSpy).toHaveBeenCalledTimes(1);
  expect(emitChangeSpy.mock.calls[0]).toEqual([
    'delete',
    { key: 'a', nextKey: null, prevKey: null, value: 1 },
  ]);

  // 2 items - delete 1st
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.delete('a');
  expect(m.getItem('a')).toBeUndefined();
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: null,
    value: 2,
  });
  expect(m.has('a')).toEqual(false);
  expect(m.has('b')).toEqual(true);
  expect(m.firstKey()).toEqual('b');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(1);
  expect(m.map((value) => value)).toEqual([2]);

  // 2 items - delete 2nd
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.delete('b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: null,
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toBeUndefined();
  expect(m.has('a')).toEqual(true);
  expect(m.has('b')).toEqual(false);
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('a');
  expect(m.length()).toEqual(1);
  expect(m.map((value) => value)).toEqual([1]);

  // 3 items - delete 2nd
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);
  m.delete('b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'c',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toBeUndefined();
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'a',
    value: 3,
  });
  expect(m.has('a')).toEqual(true);
  expect(m.has('b')).toEqual(false);
  expect(m.has('c')).toEqual(true);
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(2);
  expect(m.map((value) => value)).toEqual([1, 3]);

  expect(() => {
    m.delete('nope');
  }).toThrow('value is missing for key nope');
});

it('should map even when callback returns false', () => {
  const m = new TestMapa();
  m.set('a', 1);
  m.set('b', 1);
  expect(m.map((value) => false)).toEqual([false, false]);
});

it('should loop for each', () => {
  const m = new TestMapa<number>();
  m.set('a', 1);
  m.set('b', 2);

  let lastKey = null;

  // This implementation respects premature exits
  const map = (onValue: OnValue<number, number>) => {
    const values: (number | boolean | void)[] = [];
    m.forEach((value, key, last) => {
      const val = onValue(value, key);
      values.push(val);

      if (last) {
        lastKey = key;
      }

      return val;
    });
    return values;
  };

  expect(map((value) => value)).toEqual([1, 2]);

  expect(lastKey).toEqual('b');

  // Make sure returning false in onValue() exits loop prematurely
  expect(map((/* value */) => false)).toEqual([false]);
});

it('should get previous', () => {
  const m = createMapa();
  expect(() => {
    m.previous('a');
  }).toThrow('value is missing for key null');
  expect(m.previous('b')).toEqual(1);
  expect(m.previous('c')).toEqual(2);
});

it('should get next', () => {
  const m = createMapa();
  expect(m.next('a')).toEqual(2);
  expect(m.next('b')).toEqual(3);
  expect(() => {
    m.next('c');
  }).toThrow('value is missing for key null');
});

it('should get first and last', () => {
  const m = new TestMapa();

  expect(() => {
    m.first();
  }).toThrow('value is missing for key null');
  expect(() => {
    m.last();
  }).toThrow('value is missing for key null');

  m.set('a', 1);

  expect(m.first()).toEqual(1);
  expect(m.last()).toEqual(1);

  m.set('b', 2);

  expect(m.first()).toEqual(1);
  expect(m.last()).toEqual(2);

  m.set('c', 3);

  expect(m.first()).toEqual(1);
  expect(m.last()).toEqual(3);
});

it('should get values', () => {
  const m = createMapa();

  // Forward without key
  let values = [];
  for (const value of m.values()) {
    values.push(value);
  }
  expect(values).toEqual([1, 2, 3]);

  const vals = m.values();
  expect(vals.next().value).toEqual(1);
  expect(vals.next().value).toEqual(2);
  expect(vals.next().value).toEqual(3);

  // Forward with key
  values = [];
  for (const value of m.values('b')) {
    values.push(value);
  }
  expect(values).toEqual([2, 3]);

  // Backward without key
  values = [];
  for (const value of m.values(null, true)) {
    values.push(value);
  }
  expect(values).toEqual([3, 2, 1]);

  // Backward with key
  values = [];
  for (const value of m.values('b', true)) {
    values.push(value);
  }
  expect(values).toEqual([2, 1]);
});

it('should get entries', () => {
  const m = createMapa();

  // Forward without key
  let entries = [];
  for (const entry of m.entries()) {
    entries.push(entry);
  }
  expect(entries).toEqual([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]);

  // Forward with key
  entries = [];
  for (const entry of m.entries('b')) {
    entries.push(entry);
  }
  expect(entries).toEqual([
    ['b', 2],
    ['c', 3],
  ]);

  // Backward without key
  entries = [];
  for (const entry of m.entries(null, true)) {
    entries.push(entry);
  }
  expect(entries).toEqual([
    ['c', 3],
    ['b', 2],
    ['a', 1],
  ]);

  // Backward with key
  entries = [];
  for (const entry of m.entries('b', true)) {
    entries.push(entry);
  }
  expect(entries).toEqual([
    ['b', 2],
    ['a', 1],
  ]);
});

it('should allow for empty', () => {
  const emptyMapa = new TestMapa();

  expect(emptyMapa.isEmpty()).toEqual(true);

  // Backward when empty
  const entries = [];
  for (const entry of emptyMapa.entries(null, true)) {
    entries.push(entry);
  }
  expect(entries).toEqual([]);
});

it('should work with 0 key', () => {
  const m = new TestMapa();
  m.set(0, 'a');
  m.set(1, 'b');
  expect(m.map((value) => value)).toEqual(['a', 'b']);

  m.clear();
  m.set(-1, 'a');
  m.set(0, 'b');
  expect(m.map((value) => value)).toEqual(['a', 'b']);
});

it('should not set with null or undefined key', () => {
  const m = new TestMapa();
  expect(() => {
    m.set(null, 1);
  }).toThrow('key cannot be null');
  expect(() => {
    m.set(undefined, 1);
  }).toThrow('key cannot be null');
});

it('should throw when setting if before key missing', () => {
  const m = new TestMapa();
  expect(() => {
    m.set(2, 1, 1);
  }).toThrow('value is missing for key 1');
});

it('should set before key when one item', () => {
  // Note: appending (beforeKey=undefined) is tested above

  const m = new TestMapa();

  // Set 1st item
  m.set('a', 1, null);

  // Set 2nd item before 1st
  m.set('b', 2, 'a');
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'a',
    prevKey: null,
    value: 2,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: null,
    prevKey: 'b',
    value: 1,
  });
  expect(m.firstKey()).toEqual('b');
  expect(m.lastKey()).toEqual('a');
  expect(m.length()).toEqual(2);
});

it('should set before key when two items', () => {
  // Note: appending (beforeKey=undefined) is tested above

  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);

  // Set another item before 1st
  m.set('c', 3, 'a');
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: 'a',
    prevKey: null,
    value: 3,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: 'c',
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: 'a',
    value: 2,
  });
  expect(m.firstKey()).toEqual('c');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(3);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);

  // Set another item before 2nd
  m.set('c', 3, 'b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'c',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: 'b',
    prevKey: 'a',
    value: 3,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: 'c',
    value: 2,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(3);
});

it('should set before key when three items', () => {
  // Note: appending (beforeKey=undefined) is tested above

  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item before 1st
  m.set('d', 4, 'a');
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: 'a',
    prevKey: null,
    value: 4,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: 'd',
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'a',
    value: 2,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: 3,
  });
  expect(m.firstKey()).toEqual('d');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(4);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item before 2nd
  m.set('d', 4, 'b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'd',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: 'b',
    prevKey: 'a',
    value: 4,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'd',
    value: 2,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: 3,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(4);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item before 3rd
  m.set('d', 4, 'c');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'd',
    prevKey: 'a',
    value: 2,
  });
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: 'c',
    prevKey: 'b',
    value: 4,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'd',
    value: 3,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(4);
});

it('should move before', () => {
  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  const expectABeforeC = () => {
    expect(m.getItem('b')).toEqual({
      key: 'b',
      nextKey: 'a',
      prevKey: null,
      value: 2,
    });
    expect(m.getItem('a')).toEqual({
      key: 'a',
      nextKey: 'c',
      prevKey: 'b',
      value: 1,
    });
    expect(m.getItem('c')).toEqual({
      key: 'c',
      nextKey: null,
      prevKey: 'a',
      value: 3,
    });
    expect(m.firstKey()).toEqual('b');
    expect(m.lastKey()).toEqual('c');
    expect(m.length()).toEqual(3);
  };

  // Move a to before c
  const emitChangeSpy = jest.spyOn(m, 'emitChange');
  m.set('a', m.get('a'), 'c');
  expectABeforeC();
  const aItem = m.getItem('a');
  expect(aItem).toEqual({ key: 'a', nextKey: 'c', prevKey: 'b', value: 1 });
  expect(emitChangeSpy).toHaveBeenCalledTimes(1);
  expect(emitChangeSpy.mock.calls[0]).toEqual(['update', aItem]);

  // Move a before a
  m.set('a', m.get('a'), 'a');
  expectABeforeC();
});

it('should report if has last', () => {
  const m = new TestMapa();
  expect(m.hasLast()).toEqual(false);

  m.set('a', 1);
  expect(m.hasLast()).toEqual(true);
});

it('should throw when setting if after key missing', () => {
  const m = new TestMapa();
  expect(() => {
    m.set(2, 1, undefined, 1);
  }).toThrow('value is missing for key 1');
});

it('should set after key when one item', () => {
  // Note: appending (afterKey=undefined) is tested above

  const m = new TestMapa();

  // Set 1st item
  m.set('a', 1, undefined, null);

  // Set 2nd item after 1st
  m.set('b', 2, undefined, 'a');
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: 'a',
    value: 2,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(2);

  // Delete 2nd item
  m.delete('b');

  // Insert with afterKey=null (at the beginning) when there is 1 item
  m.set('b', 2, undefined, null);
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'a',
    prevKey: null,
    value: 2,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: null,
    prevKey: 'b',
    value: 1,
  });
  expect(m.firstKey()).toEqual('b');
  expect(m.lastKey()).toEqual('a');
  expect(m.length()).toEqual(2);
});

it('should set after key when two items', () => {
  // Note: appending (afterKey=undefined) is tested above

  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);

  // Set another item after 1st
  m.set('c', 3, undefined, 'a');
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: 'b',
    prevKey: 'a',
    value: 3,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'c',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: null,
    prevKey: 'c',
    value: 2,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('b');
  expect(m.length()).toEqual(3);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);

  // Set another item after 2nd
  m.set('c', 3, undefined, 'b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: 3,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'a',
    value: 2,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(3);
});

it('should set after key when three items', () => {
  // Note: appending (afterKey=undefined) is tested above

  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item after 1st
  m.set('d', 4, undefined, 'a');
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: 'b',
    prevKey: 'a',
    value: 4,
  });
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'd',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'd',
    value: 2,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'b',
    value: 3,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(4);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item after 2nd
  m.set('d', 4, undefined, 'b');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: 'c',
    prevKey: 'b',
    value: 4,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'd',
    prevKey: 'a',
    value: 2,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: null,
    prevKey: 'd',
    value: 3,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('c');
  expect(m.length()).toEqual(4);

  // Reset
  m.clear();
  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  // Set another item after 3rd
  m.set('d', 4, undefined, 'c');
  expect(m.getItem('a')).toEqual({
    key: 'a',
    nextKey: 'b',
    prevKey: null,
    value: 1,
  });
  expect(m.getItem('b')).toEqual({
    key: 'b',
    nextKey: 'c',
    prevKey: 'a',
    value: 2,
  });
  expect(m.getItem('d')).toEqual({
    key: 'd',
    nextKey: null,
    prevKey: 'c',
    value: 4,
  });
  expect(m.getItem('c')).toEqual({
    key: 'c',
    nextKey: 'd',
    prevKey: 'b',
    value: 3,
  });
  expect(m.firstKey()).toEqual('a');
  expect(m.lastKey()).toEqual('d');
  expect(m.length()).toEqual(4);
});

it('should move after', () => {
  const m = new TestMapa();

  m.set('a', 1);
  m.set('b', 2);
  m.set('c', 3);

  const expectAAfterC = () => {
    expect(m.getItem('b')).toEqual({
      key: 'b',
      nextKey: null,
      prevKey: 'c',
      value: 2,
    });
    expect(m.getItem('a')).toEqual({
      key: 'a',
      nextKey: 'c',
      prevKey: null,
      value: 1,
    });
    expect(m.getItem('c')).toEqual({
      key: 'c',
      nextKey: 'b',
      prevKey: 'a',
      value: 3,
    });
    expect(m.firstKey()).toEqual('a');
    expect(m.lastKey()).toEqual('b');
    expect(m.length()).toEqual(3);
  };

  // Move c to after a
  m.set('c', m.get('c'), undefined, 'a');
  const cItem = m.getItem('c');
  expectAAfterC();
  expect(cItem).toEqual({ key: 'c', nextKey: 'b', prevKey: 'a', value: 3 });

  // Move c after c
  m.set('c', m.get('c'), undefined, 'c');
  expectAAfterC();
});

it('should throw if both beforeKey and afterKey are defined', () => {
  const m = new TestMapa();

  const err = 'cannot specify both beforeKey and afterKey';

  expect(() => m.set('a', 1, 'b', 'c')).toThrow(err);
  expect(() => m.set('a', 1, null, 'c')).toThrow(err);
  expect(() => m.set('a', 1, 'b', null)).toThrow(err);
  expect(() => m.set('a', 1, null, null)).toThrow(err);
});

const keyFalsyError = 'key cannot be null or undefined';

it('setItem should throw when undefined or null', () => {
  const m = new TestMapa();
  const item = {
    key: 'a',
    nextKey: null,
    prevKey: null,
    value: 1,
  };
  expect(() => m.setItem(undefined, item)).toThrow(keyFalsyError);
  expect(() => m.setItem(null, item)).toThrow(keyFalsyError);
});

it('deleteItem should throw when undefined or null', () => {
  const m = new TestMapa();
  expect(() => m.deleteItem(undefined)).toThrow(keyFalsyError);
  expect(() => m.deleteItem(null)).toThrow(keyFalsyError);
});
