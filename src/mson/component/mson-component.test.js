import MSONComponent from './mson-component';

// Note: this is needed so that MSONComponent has a reference to the compiler
import '../compiler';

it('should build in constructor', () => {
  const component = new MSONComponent({
    definition: {
      name: 'name',
      component: 'TextField',
      label: 'Name'
    }
  });

  component.setValue('Robert Plant');
  expect(component.getValue()).toEqual('Robert Plant');
});
