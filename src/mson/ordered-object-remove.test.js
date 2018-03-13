import OrderedObject from './ordered-object-remove';

it('should add', () => {
  const items = new OrderedObject();
  items.add('a', { v: 'a' });
  expect(items.index('a')).toEqual(0);
});

it('should map', () => {
  const items = new OrderedObject();
  items.add('a', { v: 'a' });
  items.add('b', { v: 'b' });

  expect(items.map(item => item)).toEqual([{ v: 'a' }, { v: 'b' }]);
});

it('should map when items removed', () => {
  const items = new OrderedObject();
  items.add('a', { v: 'a' });
  items.add('b', { v: 'b' });
  items.add('c', { v: 'c' });
  items.remove('b');

  expect(items.removed('b')).toEqual(true);

  expect(items.map(item => item)).toEqual([{ v: 'a' }, { v: 'c' }]);
});

it('should get first', () => {
  const items = new OrderedObject();
  items.add('a', { v: 'a' });
  items.add('b', { v: 'b' });

  expect(items.first()).toEqual({ v: 'a' });

  items.remove('a');
  expect(items.last()).toEqual({ v: 'b' });
});

it('should get last', () => {
  const items = new OrderedObject();
  items.add('a', { v: 'a' });
  items.add('b', { v: 'b' });

  expect(items.last()).toEqual({ v: 'b' });

  items.remove('b');
  expect(items.last()).toEqual({ v: 'a' });
});
