import Redirect from './redirect';

it('should default to front end', () => {
  const redirect = new Redirect();
  expect(redirect.get('layer')).toEqual('frontEnd');
});

it('should redirect', async () => {
  const redirect = new Redirect({ path: '/account' });

  // Mock
  redirect._globals = {
    redirect: () => {}
  };

  const redirectSpy = jest.spyOn(redirect._globals, 'redirect');

  // No role
  await redirect.act();
  expect(redirectSpy).toHaveBeenCalledWith('/account');
});
