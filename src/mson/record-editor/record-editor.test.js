import compiler from '../compiler';
import testUtils from '../test-utils';
import GetRecord from '../actions/get-record';
import _ from 'lodash';

let acts = null;
let editAccount = null;

beforeAll(() => {
  compiler.registerComponent('app.ChangePasswordForm', {
    component: 'Form',
    fields: [
      {
        component: 'PasswordField',
        name: 'password',
        label: 'New Password',
        required: true
      },
      {
        component: 'PasswordField',
        name: 'retypePassword',
        label: 'Retype Password',
        required: true
      }
    ],
    validators: [
      {
        where: {
          retypePassword: {
            value: {
              $ne: '{{password.value}}'
            }
          }
        },
        error: {
          field: 'retypePassword',
          error: 'must match'
        }
      }
    ]
  });

  compiler.registerComponent('app.ChangePassword', {
    component: 'RecordEditor',
    baseForm: 'app.ChangePasswordForm',
    label: 'Password'
  });

  compiler.registerComponent('app.Account', {
    component: 'Form',
    fields: [
      {
        component: 'PersonNameField',
        name: 'name',
        label: 'Name',
        required: true
      },
      {
        component: 'EmailField',
        name: 'email',
        label: 'Email',
        required: true
      },
      {
        component: 'PasswordField',
        name: 'password',
        label: 'New Password',
        in: false,
        out: false
      }
    ]
  });

  compiler.registerComponent('app.EditAccount', {
    component: 'RecordEditor',
    baseForm: 'app.Account',
    label: 'Account',
    recordWhere: {
      id: 'foo'
    },
    storeType: 'app.Account'
  });
});

afterAll(() => {
  compiler.deregisterComponent('app.ChangePasswordForm');
  compiler.deregisterComponent('app.ChangePassword');
  compiler.deregisterComponent('app.Account');
  compiler.deregisterComponent('app.EditAccount');
});

const clearActs = () => {
  acts = [];
};

beforeEach(() => {
  clearActs();
});

const mockActions = actions => {
  actions.forEach(action => {
    const actions = action._actions;
    if (actions) {
      mockActions(actions);
    } else {
      const origAct = action.act;
      action.act = (...args) => {
        acts.push({
          name: action.getClassName(),
          props: action.get()
        });
        return origAct.apply(action, args);
      };

      if (action instanceof GetRecord) {
        action._recordGet = async () => {
          return {
            data: {
              record: {
                id: '1',
                userId: '1',
                fieldValues: {
                  name: 'Miles Davis',
                  email: 'miles@example.com',
                  password: 'miles12345'
                }
              }
            }
          };
        };
      }
    }
  });
};

const mockRecordEditor = (recordEditor, event) => {
  const listeners = recordEditor.get('listeners');
  listeners.forEach(listener => {
    if (listener.event === event) {
      mockActions(listener.actions);
    }
  });
};

const expectActsToContain = expActs => {
  expect(acts).toHaveLength(expActs.length);
  expActs.forEach((expAct, i) => {
    const act = acts[i];
    const actualProps = {};
    _.each(expAct.props, (value, name) => {
      actualProps[name] = act.props[name];
    });
    const actualAct = { name: act.name, props: actualProps };
    expect(actualAct).toEqual(expAct);
  });
};

it('should auto validate', () => {
  const changePassword = compiler.newComponent({
    component: 'app.ChangePassword'
  });
  changePassword.set({ autoValidate: true });
  changePassword.getField('password').setValue('secret123');
  changePassword.getField('retypePassword').setValue('secret1234');
  expect(changePassword.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' }
  ]);
});

const emitLoadAndWait = async () => {
  const loaded = testUtils.once(editAccount, 'loaded');
  editAccount.emitLoad();
  await loaded;
};

const beforeEachLoadTest = async (event, props) => {
  editAccount = compiler.newComponent({
    component: 'app.EditAccount',
    ...props
  });
  mockRecordEditor(editAccount, event);
};

it('should load with preview and recordWhere', async () => {
  await beforeEachLoadTest('load');
  await emitLoadAndWait();

  expectActsToContain([
    {
      name: 'Set',
      props: {
        name: 'isLoading',
        value: true
      }
    },
    {
      name: 'GetRecord',
      props: {
        type: 'app.Account',
        where: {
          id: 'foo'
        }
      }
    },
    {
      name: 'Set',
      props: {
        name: 'value',
        value: '{{arguments.fieldValues}}'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'userId',
        value: '{{arguments.userId}}'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'fields.id.value',
        value: '{{arguments.id}}'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'pristine',
        value: true
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'read'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'isLoading',
        value: false
      }
    }
  ]);

  // Sanity test
  expect(editAccount.getValues({ out: true })).toEqual({
    id: '1',
    name: 'Miles Davis',
    email: 'miles@example.com'
  });
});

it('should load without preview and recordWhere', async () => {
  await beforeEachLoadTest('load', {
    preview: false,
    recordWhere: null
  });
  await emitLoadAndWait();

  expectActsToContain([
    {
      name: 'Set',
      props: {
        name: 'isLoading',
        value: true
      }
    },
    {
      name: 'Set',
      props: {
        name: 'pristine',
        value: true
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'edit'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'isLoading',
        value: false
      }
    }
  ]);
});

it('should read', async () => {
  await beforeEachLoadTest('read');
  const didRead = testUtils.once(editAccount, 'didRead');
  await editAccount.emitChange('read');
  await didRead;

  expectActsToContain([
    {
      name: 'Set',
      props: {
        name: 'mode',
        value: 'read'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'editable',
        value: false
      }
    },
    {
      name: 'Set',
      props: {
        name: 'fields.save.hidden',
        value: true
      }
    },
    {
      name: 'Set',
      props: {
        name: 'fields.edit.hidden',
        value: false
      }
    },
    {
      name: 'Set',
      props: {
        name: 'fields.cancel.hidden',
        value: true
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'didRead'
      }
    }
  ]);
});

// TODO:
// edit
// canSubmit
// cannotSubmit
// save
// cancel

// TODO: edit password scenario
