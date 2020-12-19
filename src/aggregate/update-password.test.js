import compiler from '../compiler';
import testUtils from '../test-utils';

let acts;
let editor;

beforeEach(() => {
  acts = [];
  editor = compiler.newComponent({
    component: 'UpdatePassword',
    componentToWrap: {
      component: 'User',
    },
  });
});

it('should auto validate', async () => {
  editor.set({ autoValidate: true });
  editor.setValues({
    username: 'test@example.com',
    password: 'secret123',
    retypePassword: 'secret1234',
  });
  expect(editor.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' },
  ]);
});
