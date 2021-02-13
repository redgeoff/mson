import compiler from '../compiler';

it('should execute function', async () => {
  const script = compiler.newComponent({
    component: 'JavaScript',
    function: (props) => props,
  });

  // Mock
  jest.spyOn(script._globals, 'get').mockImplementation((name) => {
    if (name === 'path') {
      return 'https://example.com';
    }
  });
  jest
    .spyOn(script._componentFillerProps, '_getSession')
    .mockImplementation(() => {
      return {
        user: {
          roleNames: ['admin'],
        },
      };
    });

  const output = await script.run({ arguments: 'foo' });
  expect(output).toEqual({ ...output, arguments: 'foo' });

  expect(output.globals.get('path')).toEqual('https://example.com');
  expect(output.session.user.roleNames).toEqual(['admin']);

  // TODO: also test self
});

it('should execute async function', async () => {
  const script = compiler.newComponent({
    component: 'JavaScript',
    function: (props) => Promise.resolve(props),
  });

  const output = await script.run({ arguments: 'foo' });
  expect(output).toEqual({ ...output, arguments: 'foo' });
});

// Note: this code is intentionally commented out. See java-script.js for an explanation on why we
// don't support deserialization with `new Function()`.
//
// it('should serialize and deserialize function', async () => {
//   const fun = (props) => props;

//   const script = compiler.newComponent({
//     component: 'JavaScript',
//     function: fun.toString(),
//   });

//   const output = await script.run({ arguments: 'foo' });
//   expect(output).toEqual({ ...output, arguments: 'foo' });
// });
