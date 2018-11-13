import GridItem from './grid-item';
import Component from './component';

it('should set parent', () => {
  const component = new Component();
  const item = new GridItem({
    content: component
  });
  expect(component.get('parent')).toEqual(item);
});
