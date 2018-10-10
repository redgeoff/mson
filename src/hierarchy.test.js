import Hierarchy from './hierarchy';

const countries = [
  { id: 1, obj: 'Germany' },
  { id: 2, parentId: null, obj: 'USA' }
];

const germany = [
  { id: 3, parentId: 1, obj: 'BMW' },
  { id: 4, parentId: 1, obj: 'Mercedes' }
];

const bmw = [
  { id: 6, parentId: 3, obj: 'i3' },
  { id: 7, parentId: 3, obj: 'i8' }
];

const hierarchy = new Hierarchy([
  ...countries,

  ...germany,

  { id: 5, parentId: 2, obj: 'Tesla' },

  ...bmw,

  { id: 8, parentId: 4, obj: 'S-Class' },

  { id: 9, parentId: 5, obj: 'Model S' }
]);

const eachByParentToArray = parentId => {
  let items = [];
  hierarchy.eachByParent(parentId, item => items.push(item));
  return items;
};

it('should each by parent', () => {
  expect(eachByParentToArray(null)).toEqual(countries);
  expect(eachByParentToArray(3)).toEqual(bmw);
});

it('should map by parent', () => {
  expect(hierarchy.mapByParent(1, item => item)).toEqual(germany);

  expect(hierarchy.mapByParent('missing-id', item => item)).toEqual([]);
});

it('should create a hierarchy without items', () => {
  new Hierarchy();
});

it('should get', () => {
  expect(hierarchy.get(5)).toEqual({ id: 5, parentId: 2, obj: 'Tesla' });
});
