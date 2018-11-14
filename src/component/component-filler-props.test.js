import ComponentFillerProps, { Getter } from './component-filler-props';

it('should get session when client has been registered', () => {
  const filler = new ComponentFillerProps();

  // Mock
  const session = {};
  filler._registrar = {
    client: {
      user: {
        getSession: () => session
      }
    }
  };

  expect(filler._getSession()).toEqual(session);
});

it('should get', () => {
  const getter = new Getter({ action: undefined, component: undefined });

  // Action when no _action
  expect(getter.get('action.foo')).toBeUndefined();

  // Action when _action
  getter._action = {
    get: () => 'bar'
  };
  expect(getter.get('action.foo')).toEqual('bar');

  // Component when no _component
  expect(getter.get('foo')).toBeUndefined();

  // Component when _component
  getter._component = {
    get: () => 'baz'
  };
  expect(getter.get('foo')).toEqual('baz');

  // globals or arguments
  expect(getter.get('globals')).toBeUndefined();
  expect(getter.get('arguments')).toBeUndefined();
});
