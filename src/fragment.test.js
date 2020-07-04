import Fragment from './fragment';
import GridItem from './grid-item';

it('should set parent', () => {
  const item = new GridItem();
  const fragment = new Fragment({
    items: [item],
  });
  expect(item.get('parent')).toEqual(fragment);
});
