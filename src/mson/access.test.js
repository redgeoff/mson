import { Access } from './access';
import Form from './form';

let myRoles = [];

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
