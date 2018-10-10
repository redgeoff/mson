import ComponentFillerProps from './component-filler-props';

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
