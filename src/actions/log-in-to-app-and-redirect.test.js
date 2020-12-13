import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;

beforeEach(() => {
  acts = [];
});

const form = compiler.newComponent({
  component: 'Form',
});

const expectLogInToAppToHaveBeenCalled = () => {
  const logInToAppSpy = acts[0].spy;
  expect(logInToAppSpy).toHaveBeenCalledWith({
    ...logInToAppSpy.mock.calls[0][0],
    component: form,
  });
};

it('should log in to app and redirect when no redirectAfterLogin', async () => {
  const logInToAppAndRedirect = compiler.newComponent({
    component: 'LogInToAppAndRedirect',
  });

  testUtils.mockAction(logInToAppAndRedirect, acts, true);

  await logInToAppAndRedirect.run({
    component: form,
  });

  expectLogInToAppToHaveBeenCalled();

  testUtils.expectActsToContain(acts, [
    {
      name: 'LogInToApp',
    },
    {
      name: 'Redirect',
      props: {
        path: '/',
      },
    },
  ]);
});

it('should log in to app and redirect when redirectAfterLogin', async () => {
  const logInToAppAndRedirect = compiler.newComponent({
    component: 'LogInToAppAndRedirect',
  });

  const redirectAfterLogin = 'example.com';

  const mockedGlobals = {
    redirectAfterLogin,
  };

  testUtils.mockAction(logInToAppAndRedirect, acts, true, mockedGlobals);

  await logInToAppAndRedirect.run({
    component: form,
  });

  expectLogInToAppToHaveBeenCalled();

  testUtils.expectActsToContain(acts, [
    {
      name: 'LogInToApp',
    },
    {
      name: 'Redirect',
      props: {
        path: redirectAfterLogin,
      },
    },
    {
      name: 'Set',
      props: {
        name: 'globals.redirectAfterLogin',
        value: null,
      },
    },
  ]);
});
