import Form from './form';
import MSONComponent from '../component/mson-component';

export default class User extends Form {
  className = 'User';

  create(props) {
    super.create(props);

    // Note: we use MSONComponents as EmailField and PasswordField are uncompiled and importing from
    // ../fields would create a circular dependency.
    const fields = [
      new MSONComponent({
        definition: {
          component: 'EmailField',
          name: 'username',
          label: 'Email',
          required: true,
          // in: false,
        },
      }),
      new MSONComponent({
        definition: {
          component: 'PasswordField',
          name: 'password',
          label: 'Password',
          // required: true, // Required by listeners when creating
          in: false,
          out: false,
          hidden: true,
          forbidSort: true,
        },
      }),
    ];

    const schema = {
      component: 'Form',
      fields: [
        {
          name: 'roles',
          component: 'RolesField',
        },
      ],
    };

    // By default, lock down access
    const access = {
      form: {
        create: 'admin',
        read: 'admin',
        update: 'admin',
        archive: 'admin',
      },
    };

    this.set({
      schema,
      access,
      fields,
    });
  }
}
