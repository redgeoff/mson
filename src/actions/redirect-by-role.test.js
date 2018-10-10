import RedirectByRole from './redirect-by-role';

it('should default to front end', () => {
  const redirectByRole = new RedirectByRole();
  expect(redirectByRole.get('layer')).toEqual('frontEnd');
});

it('should redirect by role', async () => {
  const routes = [
    {
      roles: ['admin', 'manager'],
      path: '/employees'
    },
    {
      path: '/account'
    }
  ];

  const redirectByRole = new RedirectByRole({ routes });

  let myRoles = [];

  // Mock
  redirectByRole._registrar = {
    client: {
      user: {
        hasRole: roles => {
          let has = false;
          roles.forEach(role => {
            if (myRoles.indexOf(role) !== -1) {
              has = true;
            }
          });
          return has;
        }
      }
    }
  };
  redirectByRole._globals = {
    redirect: () => {}
  };

  const redirectSpy = jest.spyOn(redirectByRole._globals, 'redirect');

  // No role
  await redirectByRole.act();
  expect(redirectSpy).toHaveBeenCalledWith('/account');

  // manager role
  myRoles.push('manager');
  redirectSpy.mockReset();
  await redirectByRole.act();
  expect(redirectSpy).toHaveBeenCalledWith('/employees');
});
