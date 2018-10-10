import BaseComponent from './component';

it('should concat schemas', () => {
  const c = new BaseComponent({
    schema: 'one'
  });
  c.set({ schema: 'two' });
  c.set({ schema: 'three' });
  expect(c.get('schema')).toEqual([
    c._getBaseComponentSchema(),
    c._getWrappedComponentSchema(),
    'one',
    'two',
    'three'
  ]);
});
