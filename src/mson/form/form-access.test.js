import FormAccess from './form-access';

it('should validate', () => {
  let access = new FormAccess();

  access.setValues({});

  access.validate();
  expect(access.hasErr()).toEqual(false);

  access = new FormAccess({ fieldNames: ['firstName'] });
  access.setValues({
    form: {
      create: 'role2',
      read: ['role1', 'role2'],
      update: ['role1', 'role2'],
      archive: 'role2'
    },

    fields: {
      firstName: {
        create: 'role2',
        read: ['role1', 'role2'],
        update: 'role2',
        archive: 'role2'
      }
    }
  });
  access.validate();
  expect(access.hasErr()).toEqual(false);

  access.setValues({
    form: {
      create: 'role2',
      badRole: 'role2'
    },

    fields: {
      firstName: {
        create: 'role2',
        badRole: 'role2'
      },
      badField: {
        create: 'role2'
      }
    }
  });

  access.validate();
  expect(access.hasErr()).toEqual(true);
  expect(access.getErrs()).toEqual([
    {
      field: 'form',
      error: [
        {
          field: 'badRole',
          error: 'undefined field'
        }
      ]
    },
    {
      field: 'fields',
      error: [
        {
          field: 'badField',
          error: 'undefined field'
        },
        {
          field: 'firstName',
          error: [
            {
              field: 'badRole',
              error: 'undefined field'
            }
          ]
        }
      ]
    }
  ]);
});
