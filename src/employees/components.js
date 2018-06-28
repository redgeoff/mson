export const employee = {
  name: 'app.Employee',
  component: 'User',
  fields: [
    {
      component: 'PersonNameField',
      name: 'firstName',
      label: 'First Name',
      required: true,
      block: false,
      before: 'username'
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true,
      before: 'username'
    },
    {
      name: 'departments',
      label: 'Departments',
      component: 'SelectField',

      // TODO: is this really the best way to handle this? A better alternative is probably to load
      // the options in the backend as well.
      ensureInList: false,
      multiple: true
    },
    {
      component: 'SelectField',
      name: 'roles',
      label: 'Roles',
      multiple: true,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' }
      ]
    }
  ],
  roles: ['employee'],
  access: {
    form: {
      create: 'admin',
      read: ['admin', 'employee'],
      update: ['admin', 'owner', 'manager'],
      archive: ['admin']
    },
    fields: {
      password: {
        update: ['admin', 'owner']
      },
      roles: {
        update: 'admin'
      },
      departments: {
        update: 'manager'
      }
    }
  }
};

export const department = {
  name: 'app.Department',
  component: 'Form',
  fields: [
    {
      component: 'PersonNameField',
      name: 'name',
      label: 'Name',
      required: true
    },
    {
      component: 'TextField',
      name: 'employeeNotes',
      label: 'Employee Notes',
      required: true
    },
    {
      component: 'TextField',
      name: 'adminNotes',
      label: 'Admin Notes',
      required: true
    },
    {
      component: 'TextField',
      name: 'ownerNotes',
      label: 'Owner Notes'
    }
  ],
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ],
  access: {
    form: {
      create: 'employee',
      update: 'employee',
      archive: 'employee'
    },
    fields: {
      employeeNotes: {
        create: ['employee', 'admin'],
        read: ['employee', 'admin'],
        update: ['employee', 'admin']
      },
      adminNotes: {
        create: 'admin',
        read: 'admin',
        update: 'admin'
      },
      ownerNotes: {
        create: 'employee',
        update: 'owner'
      }
    }
  }
};
