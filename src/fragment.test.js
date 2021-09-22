import Fragment from './fragment';
import GridItem from './grid-item';
import TextField from './fields/text-field';

it('should set parent', () => {
  const item = new GridItem();
  const fragment = new Fragment({
    items: [item],
  });
  expect(item.get('parent')).toEqual(fragment);
});

it('should set with item index', () => {
  const fragment = new Fragment({
    items: [new TextField({ value: 'Bon' }), new TextField({ value: 'Jovi' })],
  });
  expect(fragment.get('items.0.value')).toEqual('Bon');
  expect(fragment.get('items.1.value')).toEqual('Jovi');
});

it('should set with item name', () => {
  const fragment = new Fragment({
    items: [
      new TextField({ name: 'first', value: 'Bon' }),
      new TextField({ name: 'last', value: 'Jovi' }),
    ],
  });
  expect(fragment.get('items.first.value')).toEqual('Bon');
  expect(fragment.get('items.last.value')).toEqual('Jovi');
});
