import Grid from './grid';
import GridItem from './grid-item';

it('should set parent', () => {
  const item = new GridItem();
  const grid = new Grid({
    items: [item]
  });
  expect(item.get('parent')).toEqual(grid);
});
