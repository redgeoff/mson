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

it('should not preserve class name', () => {
  const component = new MSONComponent({
    definition: {
      name: 'name',
      component: 'TextField'
    }
  });

  expect(component.getClassName()).toEqual('TextField');
});

it('should set and get compiler', () => {
  const compiler = {};
  const component = new MSONComponent();
  component._setCompiler(compiler);
  expect(component._getCompiler()).toEqual(compiler);
});

it('should throw if compiler not registered', () => {
  const component = new MSONComponent();

  // Simulate compiler not being registered
  component._registrar = {};

  expect(() =>
    component.set({
      definition: null
    })
  ).toThrow();
});
