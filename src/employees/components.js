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
      label: 'Admin Notes'
      // required: true // TODO: uncomment after implement ignoreErrs
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
      }
    }
  }
};
