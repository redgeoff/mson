import compiler from './compiler';
import globals from '../globals';
import testUtils from '../test-utils';

beforeAll(() => {
  compiler.registerComponent('org.proj.Account', {
    component: 'Form',
    fields: [
      {
        component: 'TextField',
        name: 'name',
        label: 'Name',
        required: true,
        help: 'Enter a full name'
      },
      {
        component: 'EmailField',
        name: 'email',
        label: 'Email',
        required: true
      }
    ]
  });

  // Inheritance
  compiler.registerComponent('org.proj.EditAccount', {
    component: 'org.proj.Account',
    fields: [
      {
        component: 'ButtonField',
        name: 'save',
        label: 'Save'
      },
      {
        component: 'ButtonField',
        name: 'cancel',
        label: 'Cancel'
      }
    ]
  });

  // Dynamic inheritance
  compiler.registerComponent('org.proj.EditThing', {
    component: '{{thing}}'
  });

  // Dynamic nested inheritance
  compiler.registerComponent('org.proj.EditNestedThing', {
    component: 'Form',
    thing: '{{thing}}', // Passes thing to form
    form: {
      component: '{{thing}}',
      fields: [
        {
          component: 'ButtonField',
          name: 'edit',
          label: 'Edit'
        }
      ]
    }
  });

  // Dynamic nested inheritance in registration
  compiler.registerComponent('org.proj.EditNestedRegistrationThing', {
    thing: 'org.proj.EditAccount',
    component: 'org.proj.EditNestedThing'
  });

  compiler.registerComponent('org.proj.EditAccount1', {
    component: 'org.proj.EditAccount'
  });

  compiler.registerComponent('org.proj.EditAccount2', {
    component: 'org.proj.EditAccount'
  });

  // Template parameters in listeners
  compiler.registerComponent('org.proj.TemplatedListeners', {
    component: 'Form',
    listeners: [
      {
        event: 'create',
        actions: [
          {
            component: 'Snackbar',
            if: {
              foo: 'bar'
            },
            message: '{{foo}} this'
          }
        ]
      }
    ]
  });
});

afterAll(() => {
  compiler.deregisterComponent('org.proj.EditAccount');
  compiler.deregisterComponent('org.proj.Account');
  compiler.deregisterComponent('org.proj.EditThing');
  compiler.deregisterComponent('org.proj.EditNestedThing');
  compiler.deregisterComponent('org.proj.EditNestedRegistrationThing');
  compiler.deregisterComponent('org.proj.EditAccount1');
  compiler.deregisterComponent('org.proj.EditAccount2');
  compiler.deregisterComponent('org.proj.TemplatedListeners');
});

it('should build & destroy', () => {
  const account = compiler.newComponent({
    component: 'org.proj.Account'
  });
  expect(account._fields.length()).toEqual(3);
});

it('should implement inheritance', () => {
  const account = compiler.newComponent({
    component: 'org.proj.EditAccount'
  });
  expect(account._fields.length()).toEqual(5);
});

it('should implement dynamic inheritance', () => {
  const thing1 = compiler.newComponent({
    thing: 'org.proj.EditAccount',
    component: 'org.proj.EditThing'
  });
  expect(thing1._fields.length()).toEqual(5);

  // We test with 2 dynamic inheritance back to back to make sure that we haven't cached any
  // previous component building.
  const thing2 = compiler.newComponent({
    thing: 'org.proj.Account',
    component: 'org.proj.EditThing'
  });
  expect(thing2._fields.length()).toEqual(3);
});

it('should implement dynamic nested inheritance', () => {
  const thing = compiler.newComponent({
    thing: 'org.proj.EditAccount',
    component: 'org.proj.EditNestedThing'
  });
  expect(thing._fields.length()).toEqual(6);
});

it('should implement dynamic nested inheritance in registration', () => {
  const thing = compiler.newComponent({
    component: 'org.proj.EditNestedRegistrationThing'
  });
  expect(thing._fields.length()).toEqual(6);
});

it('should not share components', () => {
  const account1 = compiler.newComponent({
    component: 'org.proj.EditAccount1'
  });

  const account2 = compiler.newComponent({
    component: 'org.proj.EditAccount2'
  });

  account1.setEditable(false);
  expect(account1.getField('name').get('editable')).toEqual(false);

  // Should still be true
  expect(account2.getField('name').get('editable')).toEqual(true);
});

it('should support template parameters in listeners', async () => {
  const snackbarDisplayed = testUtils.once(globals, 'displaySnackbar');
  compiler.newComponent({
    component: 'org.proj.TemplatedListeners',
    foo: 'bar'
  });
  await snackbarDisplayed;

  // Check snackbar message
  expect(globals.get('snackbarMessage')).toEqual('bar this');
});
