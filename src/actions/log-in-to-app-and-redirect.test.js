import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;

beforeEach(() => {
  acts = [];
});

it('should log in to app and redirect', async () => {
  const logInToAppAndRedirect = compiler.newComponent({
    component: 'LogInToAppAndRedirect',
  });

  const form = compiler.newComponent({
    component: 'Form',
  });

  testUtils.mockAction(logInToAppAndRedirect, acts, true);

  await logInToAppAndRedirect.run({
    component: form,
  });

  const logInToAppSpy = acts[0].spy;
  expect(logInToAppSpy).toHaveBeenCalledWith({
    ...logInToAppSpy.mock.calls[0][0],
    component: form,
  });
});
