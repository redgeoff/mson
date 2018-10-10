import compiler from '../compiler';
import testUtils from '../test-utils';
import MemoryStore from '../stores/memory-store';
import each from 'lodash/each';

let acts = null;
let editAccount = null;
let docsCreated = null;

class MockStore extends MemoryStore {
  _create(props) {
    super._create(props);

    this._docs.set('1', {
      id: '1',
      userId: '1',
      archivedAt: 1537475650372,
      createdAt: 1537475590372,
      updatedAt: 1537475710372,
      fieldValues: {
        name: 'Miles Davis',
        email: 'miles@example.com',
        password: 'miles12345'
      }
    });
  }

  async _createDoc(props) {
    docsCreated.push(props);
    return super._createDoc(props);
  }
}

beforeAll(() => {
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

  compiler.registerComponent('app.MyStore', MockStore);

  compiler.registerComponent('app.EditAccount', {
    component: 'RecordEditor',
    baseForm: {
      component: 'app.Account'
    },
    label: 'Account',
    storeWhere: {
      id: '1'
    },
    store: {
      component: 'app.MyStore'
    }
  });

  compiler.registerComponent('app.ChangePasswordForm', {
    component: 'app.Account',
    fields: [
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
          fields: {
            retypePassword: {
              value: {
                $ne: '{{password.value}}'
              }
            }
          }
        },
        error: {
          field: 'retypePassword',
          error: 'must match'
        }
      }
    ],
    listeners: [
      {
        event: 'create',
        actions: [
          {
            component: 'Set',
            name: 'hidden',
            value: true
          },
          {
            component: 'Set',
            name: 'out',
            value: false
          },
          {
            component: 'Set',
            name: 'required',
            value: false
          },
          {
            component: 'Set',
            name: 'fields.password.hidden',
            value: false
          },
          {
            component: 'Set',
            name: 'fields.password.required',
            value: true
          },
          {
            component: 'Set',
            name: 'fields.password.out',
            value: true
          },
          {
            component: 'Set',
            name: 'fields.retypePassword.hidden',
            value: false
          },
          {
            component: 'Set',
            name: 'fields.retypePassword.required',
            value: true
          }
        ]
      }
    ]
  });

  compiler.registerComponent('app.ChangePassword', {
    component: 'RecordEditor',
    baseForm: {
      component: 'app.ChangePasswordForm'
    },
    label: 'Password',
    store: {
      component: 'MemoryStore'
    }
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
  docsCreated = [];
});

const mockActions = (actions, spyOnAct) => {
  actions.forEach(action => {
    const actions = action._actions;
    if (actions) {
      mockActions(actions, spyOnAct);
    } else {
      if (spyOnAct) {
        const origAct = action.act;
        action.act = function() {
          acts.push({
            name: action.getClassName(),
            props: action.get()
          });
          return origAct.apply(this, arguments);
        };
      }
    }
  });
};

const mockRecordEditor = (recordEditor, event) => {
  const listeners = recordEditor.get('listeners');
  listeners.forEach(listener => {
    const spyOnAct = listener.event === event;
    mockActions(listener.actions, spyOnAct);
  });
};

const expectActsToContain = expActs => {
  expect(acts).toHaveLength(expActs.length);
  expActs.forEach((expAct, i) => {
    const act = acts[i];
    const actualProps = {};
    each(expAct.props, (value, name) => {
      actualProps[name] = act.props[name];
    });
    const actualAct = { name: act.name, props: actualProps };
    expect(actualAct).toEqual(expAct);
  });
};

it('should auto validate', async () => {
  const changePassword = compiler.newComponent({
    component: 'app.ChangePassword'
  });
  await testUtils.once(changePassword, 'didCreate');
  changePassword.set({ autoValidate: true });
  changePassword.getField('password').setValue('secret123');
  changePassword.getField('retypePassword').setValue('secret1234');
  expect(changePassword.getErrs()).toEqual([
    { field: 'retypePassword', error: 'must match' }
  ]);
});

const emitLoadAndWait = async () => {
  editAccount.emitLoad();
  await editAccount.resolveAfterLoad();
};

const beforeEachLoadTest = (event, props) => {
  editAccount = compiler.newComponent({
    component: 'app.EditAccount',
    ...props
  });
  mockRecordEditor(editAccount, event);
};

it('should load with preview and storeWhere', async () => {
  beforeEachLoadTest('load');
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
      name: 'GetDoc',
      props: {
        where: {
          id: '1'
        }
      }
    },
    {
      name: 'Set',
      props: {
        name: 'value',
        value: {
          email: 'miles@example.com',
          name: 'Miles Davis',
          password: 'miles12345'
        }
      }
    },
    {
      name: 'Set',
      props: {
        name: 'value',
        value: {
          id: '1',
          userId: '1',
          archivedAt: 1537475650372,
          createdAt: 1537475590372,
          updatedAt: 1537475710372
        }
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
    ...testUtils.toDefaultFieldsObject(null),
    id: '1',
    userId: '1',
    name: 'Miles Davis',
    email: 'miles@example.com',
    archivedAt: 1537475650372,
    createdAt: 1537475590372,
    updatedAt: 1537475710372
  });
});

it('should load without preview and storeWhere', async () => {
  beforeEachLoadTest('load', {
    preview: false,
    storeWhere: null
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
  beforeEachLoadTest('read');
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
        name: 'component',
        value: {
          'fields.save.hidden': true,
          'fields.edit.hidden': false,
          'fields.cancel.hidden': true
        }
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

const getEditActs = hideCancel => {
  let acts = [
    {
      name: 'Set',
      props: {
        name: 'mode',
        value: 'update'
      }
    },
    {
      name: 'Set',
      props: {
        name: 'editable',
        value: true
      }
    },
    {
      name: 'Set',
      props: {
        name: 'component',
        value: {
          'fields.save.hidden': false,
          'fields.save.disabled': true,
          'fields.edit.hidden': true
        }
      }
    }
  ];

  if (hideCancel !== true) {
    acts.push({
      name: 'Set',
      props: {
        name: 'fields.cancel.hidden',
        value: false
      }
    });
  }

  return acts.concat([
    {
      name: 'Emit',
      props: {
        event: 'didEdit'
      }
    }
  ]);
};

it('should edit', async () => {
  beforeEachLoadTest('edit');
  const didEdit = testUtils.once(editAccount, 'didEdit');
  await editAccount.emitChange('edit');
  await didEdit;

  expectActsToContain(getEditActs());
});

it('should edit with hideCancel', async () => {
  beforeEachLoadTest('edit', { hideCancel: true });
  const didEdit = testUtils.once(editAccount, 'didEdit');
  await editAccount.emitChange('edit');
  await didEdit;

  expectActsToContain(getEditActs(true));
});

it('canSubmit', async () => {
  beforeEachLoadTest('canSubmit');
  const didCanSubmit = testUtils.once(editAccount, 'didCanSubmit');
  await editAccount.emitChange('canSubmit');
  await didCanSubmit;

  expectActsToContain([
    {
      name: 'Set',
      props: {
        name: 'fields.save.disabled',
        value: false
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'didCanSubmit'
      }
    }
  ]);
});

it('cannotSubmit', async () => {
  beforeEachLoadTest('cannotSubmit');
  const didCannotSubmit = testUtils.once(editAccount, 'didCannotSubmit');
  await editAccount.emitChange('cannotSubmit');
  await didCannotSubmit;

  expectActsToContain([
    {
      name: 'Set',
      props: {
        name: 'fields.save.disabled',
        value: true
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'didCannotSubmit'
      }
    }
  ]);
});

const getSaveActs = preview => {
  let acts = [
    {
      name: 'UpsertDoc',
      props: {}
    },
    {
      name: 'Set',
      props: {
        name: 'pristine',
        value: true
      }
    },
    {
      name: 'Snackbar',
      props: {
        message: 'Account saved'
      }
    }
  ];

  if (preview !== false) {
    acts.push({
      name: 'Emit',
      props: {
        event: 'load'
      }
    });
  }

  return acts.concat([
    {
      name: 'Emit',
      props: {
        event: 'didSave'
      }
    }
  ]);
};

it('should save', async () => {
  beforeEachLoadTest('save');
  const didSave = testUtils.once(editAccount, 'didSave');
  await editAccount.emitChange('save');
  await didSave;

  expectActsToContain(getSaveActs());
});

it('should save without preview', async () => {
  beforeEachLoadTest('save', { preview: false });
  const didSave = testUtils.once(editAccount, 'didSave');
  await editAccount.emitChange('save');
  await didSave;

  expectActsToContain(getSaveActs(false));
});

it('should cancel', async () => {
  beforeEachLoadTest('cancel');
  const didCancel = testUtils.once(editAccount, 'didCancel');
  await editAccount.emitChange('cancel');
  await didCancel;

  expectActsToContain([
    {
      name: 'Emit',
      props: {
        event: 'load'
      }
    },
    {
      name: 'Emit',
      props: {
        event: 'didCancel'
      }
    }
  ]);
});

it('should support the change password scenario', async () => {
  // A form where the out, hidden and required statuses are dynamically changed

  const changePassword = compiler.newComponent({
    component: 'app.ChangePassword',
    preview: false,
    store: new MockStore(),
    storeWhere: null
  });

  // Wait for all the create listeners to run before mocking so that we have a predictable baseline
  await changePassword.resolveAfterCreate();

  mockRecordEditor(changePassword);

  changePassword.emitLoad();
  await changePassword.resolveAfterLoad();

  changePassword.set({ autoValidate: true });

  changePassword.setValues({
    password: 'secret12345',
    retypePassword: 'secret12345'
  });
  const didSave = testUtils.once(changePassword, 'didSave');
  changePassword.getField('save').emitClick();
  await didSave;

  expect(docsCreated).toHaveLength(1);
  expect(docsCreated[0].fieldValues).toEqual({
    password: 'secret12345'
  });
});
