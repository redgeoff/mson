import AccessControl from './access-control';

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
});

it('can access field', () => {
  const indexedRoles = {
    1: true
  };

  // Can access at field layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '2'
        },
        fields: {
          firstName: {
            create: '1'
          }
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual(true);

  // Cannot access at field layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '1'
        },
        fields: {
          firstName: {
            create: '2'
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
          create: '1'
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual(true);

  // Cannot access at form layer
  expect(
    control._canAccessField(
      'create',
      {
        form: {
          create: '2'
        }
      },
      indexedRoles,
      'firstName'
    )
  ).toEqual(false);

  // Can access at global layer
  expect(
    control._canAccessField('create', {}, indexedRoles, 'firstName')
  ).toEqual(true);
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
