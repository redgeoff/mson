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

// TODO: remove after fix so that can use Employee component for this
export const tmpEmployee = {
  name: 'app.TmpEmployee',
  component: 'Form',
  fields: [
    {
      component: 'PersonNameField',
      name: 'firstName',
      label: 'First Name',
      required: true,
      block: false
    },
    {
      component: 'PersonNameField',
      name: 'lastName',
      label: 'Last Name',
      required: true
    },
    // {
    //   name: 'departments',
    //   label: 'Departments',
    //   component: 'FormsField',
    //   form: {
    //     component: 'app.Department'
    //   },
    //   store: {
    //     component: 'RecordStore',
    //     type: 'app.Department'
    //   }
    // }
    {
      name: 'departments',
      label: 'Departments',
      component: 'SelectListField',
      blankString: 'None',

      // TODO: is this really the best way to handle this? A better alternative is probably to load
      // the options in the backend as well.
      ensureInList: false

      // options: [
      //   { value: 'red', label: 'Red' },
      //   { value: 'green', label: 'Green' },
      //   { value: 'blue', label: 'Blue' }
      // ]
    }
  ],
  access: {
    form: {
      create: 'employee',
      // read: 'employee',
      update: 'employee',
      archive: 'employee'
    }
  }
};
