import testUtils from './test-utils';
import { Access } from './access';
import Form from './form';
import { TextField } from './fields';

let myRoles = [];
let sessionRoles = {};

const mockRegistrar = access => {
  access._registrar = {
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
        },

        getSession: () => {
          return {
            user: {
              roles: sessionRoles
            }
          };
        }
      }
    }
  };
};

const newAccess = () => {
  const access = new Access();
  mockRegistrar(access);
  return access;
};

afterEach(() => {
  myRoles = [];
});

it('should check access', () => {
  const access = newAccess();

  const form = new Form();

  // Access is undefined and wide open
  expect(access.canCreate(form)).toEqual(true);
  expect(access.canRead(form)).toEqual(true);
  expect(access.canUpdate(form)).toEqual(true);
  expect(access.canArchive(form)).toEqual(true);

  form.set({
    access: {
      form: {
        create: '1',
        read: ['1'],
        update: '1',
        archive: '1'
      }
    }
  });

  // Access denied as missing role
  expect(access.canCreate(form)).toEqual(false);
  expect(access.canRead(form)).toEqual(false);
  expect(access.canUpdate(form)).toEqual(false);
  expect(access.canArchive(form)).toEqual(false);

  myRoles = ['1'];

  // Access granted as has role
  expect(access.canCreate(form)).toEqual(true);
  expect(access.canRead(form)).toEqual(true);
  expect(access.canUpdate(form)).toEqual(true);
  expect(access.canArchive(form)).toEqual(true);
});

it('should get fields and values', () => {
  const access = newAccess();

  const form = new Form({
    fields: [
      new TextField({ name: 'firstName' }),
      new TextField({ name: 'lastName' })
    ],
    value: {
      firstName: 'Robert',
      lastName: 'Plant'
    },
    access: {
      fields: {
        firstName: {
          create: '100',
          read: ['100', '200'],
          update: '100',
          archive: '100'
        }
      }
    }
  });

  expect(access.fieldsCanCreate(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('create'),
    lastName: 'create'
  });
  expect(access.fieldsCanRead(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('read'),
    lastName: 'read'
  });
  expect(access.fieldsCanUpdate(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('update'),
    lastName: 'update'
  });

  expect(access.valuesCanCreate(form)).toEqual({
    id: undefined,
    lastName: 'Plant'
  });
  expect(access.valuesCanRead(form)).toEqual({
    id: undefined,
    lastName: 'Plant'
  });
  expect(access.valuesCanUpdate(form)).toEqual({
    id: undefined,
    lastName: 'Plant'
  });

  sessionRoles['id100'] = { name: '100' };

  expect(access.fieldsCanCreate(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('create'),
    firstName: 'create',
    lastName: 'create'
  });
  expect(access.fieldsCanRead(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('read'),
    firstName: 'read',
    lastName: 'read'
  });
  expect(access.fieldsCanUpdate(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('update'),
    firstName: 'update',
    lastName: 'update'
  });

  expect(access.valuesCanCreate(form)).toEqual({
    id: undefined,
    firstName: 'Robert',
    lastName: 'Plant'
  });
  expect(access.valuesCanRead(form)).toEqual({
    id: undefined,
    firstName: 'Robert',
    lastName: 'Plant'
  });
  expect(access.valuesCanUpdate(form)).toEqual({
    id: undefined,
    firstName: 'Robert',
    lastName: 'Plant'
  });

  sessionRoles = { id200: { name: '200' } };

  expect(
    access.fieldsCanAccess('update', form, { default: false }, true)
  ).toEqual({ firstName: 'read', lastName: 'update' });

  // Simulate clearing of session
  access._registrar = {
    client: {
      user: {
        getSession: () => null
      }
    }
  };
  expect(access.fieldsCanCreate(form)).toEqual({
    ...testUtils.toDefaultFieldsObject('create'),
    lastName: 'create'
  });
});
