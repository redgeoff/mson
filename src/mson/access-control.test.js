import AccessControl from './access-control';
import Roles from './roles';

const control = new AccessControl();

it('has access', () => {
  // Scalar
  expect(control._hasAccess('1', ['1', '2'])).toEqual(true);
  expect(control._hasAccess('3', ['1', '2'])).toEqual(false);

  // Array
  expect(control._hasAccess(['1', '3'], ['1', '2'])).toEqual(true);
  expect(control._hasAccess(['3', '4'], ['1', '2'])).toEqual(false);

  // No roles
  expect(control._hasAccess(['1', '3'], [])).toEqual(false);

  // Owner by Roles.ID_OWNER
  expect(control._hasAccess([Roles.ID_OWNER], [], false)).toEqual(false);
  expect(control._hasAccess([Roles.ID_OWNER], [], true)).toEqual(true);

  // Owner by Roles.OWNER
  expect(control._hasAccess([Roles.OWNER], [], true)).toEqual(true);
});

it('can access field', () => {
  const indexedRoles = {
    100: true
  };

  // Can access at field layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '200'
        },
        fields: {
          firstName: {
            create: '100'
          }
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual('create');

  // Cannot access at field layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '100'
        },
        fields: {
          firstName: {
            create: '200'
          }
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual(false);

  // Can access at form layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '100'
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual('create');

  // Cannot access at form layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '200'
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual(false);

  // Can access at global layer
  expect(
    control._canAccessField('create', {}, indexedRoles, 'firstName')
  ).toEqual('create');

  // Can access if owner
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: Roles.ID_OWNER
        }
      },
      indexedRoles,
      'firstName',
      true
    )
  ).toEqual('create');

  // Cannot access if not owner
  expect(
    control._canAccessField(
      'create',
      {
        fields: {
          firstName: {
            create: Roles.ID_OWNER
          }
        }
      },
      indexedRoles,
      'firstName',
      false
    )
  ).toEqual(false);

  // Downgrades to read
  expect(
    control._canAccessField(
      'update',
      {
        fields: {
          firstName: {
            read: ['100', '200'],
            update: '200'
          }
        }
      },
      indexedRoles,
      'firstName',
      false,
      true
    )
  ).toEqual('read');

  // Doesn't downgrade to read
  expect(
    control._canAccessField(
      'update',
      {
        fields: {
          firstName: {
            read: '200',
            update: '200'
          }
        }
      },
      indexedRoles,
      'firstName',
      false,
      true
    )
  ).toEqual(false);
});

it('can access', () => {
  const access = {
    form: {
      create: '1'
    },

    fields: {
      firstName: {
        create: '2'
      }
    }
  };

  expect(
    control.canCreate(
      access,
      {
        1: true,
        2: true
      },
      {
        firstName: null,
        lastName: null
      }
    )
  ).toEqual([]);

  expect(
    control.canCreate(
      access,
      {
        2: true
      },
      {
        firstName: null,
        lastName: null
      }
    )
  ).toEqual(['lastName']);

  expect(
    control.canCreate(
      access,
      {
        3: true
      },
      {
        firstName: null,
        lastName: null
      }
    )
  ).toEqual(['firstName', 'lastName']);
});

it('should access', () => {
  // Just a sanity test

  let indexedRoles = {
    2: true
  };

  const fieldValues = {
    firstName: null,
    lastName: null
  };

  const access = {
    form: {
      create: '2',
      read: ['1', '2'],
      update: ['1', '2'],
      archive: '2'
    },

    fields: {
      firstName: {
        create: '2',
        read: ['1', '2'],
        update: '2',
        archive: '2'
      }
    }
  };

  expect(control.canCreate(access, indexedRoles, fieldValues)).toHaveLength(0);
  expect(control.canRead(access, indexedRoles, fieldValues)).toHaveLength(0);
  expect(control.canUpdate(access, indexedRoles, fieldValues)).toHaveLength(0);
  expect(control.canArchive(access, indexedRoles, fieldValues)).toHaveLength(0);

  indexedRoles = {
    1: true
  };

  expect(control.canCreate(access, indexedRoles, fieldValues)).toHaveLength(2);
  expect(control.canRead(access, indexedRoles, fieldValues)).toHaveLength(0);
  expect(control.canUpdate(access, indexedRoles, fieldValues)).toHaveLength(1);
  expect(control.canArchive(access, indexedRoles, fieldValues)).toHaveLength(2);
});

it('can access fields', () => {
  // Sanity test as different permutations tested by 'can access field'

  let indexedRoles = {
    100: true
  };

  const fieldValues = {
    firstName: 'First',
    middleName: 'Middle',
    lastName: 'Last'
  };

  const access = {
    fields: {
      firstName: {
        read: ['100', '200'],
        update: '200'
      },
      middleName: {
        read: '200',
        update: '200'
      }
    }
  };

  expect(
    control.fieldsCanAccess(
      'update',
      access,
      indexedRoles,
      fieldValues,
      false,
      true
    )
  ).toEqual({ firstName: 'read', lastName: 'update' });

  expect(
    control.valuesCanAccess('update', access, indexedRoles, fieldValues, false)
  ).toEqual({ lastName: 'Last' });
});
