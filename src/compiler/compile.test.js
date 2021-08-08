import compile from './compile';

it('should compile', () => {
  const MyComponent = compile({
    component: 'Component',
    name: 'MyComponent',
  });

  const myComponent = new MyComponent();
  expect(myComponent.getClassName()).toEqual('MyComponent');
});
