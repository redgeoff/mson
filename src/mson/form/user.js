import Form from './form';
import MSONComponent from '../component/mson-component';
import Roles from '../roles';

export default class User extends Form {
  _create(props) {
    super._create(props);

    this.addField(
      new MSONComponent({
        definition: {
          component: 'EmailField',
          name: 'username',
          label: 'Email',
          required: true
          // in: false,
        }
      })
    );

    this.addField(
      new MSONComponent({
        definition: {
          component: 'PasswordField',
          name: 'password',
          label: 'Password',
          // required: true, // Required by listeners when creating
          in: false,
          out: false,
          hidden: true,
          forbidSort: true
        }
      })
    );

    const schema = {
      component: 'Form',
      fields: [
        {
          name: 'roles',
          component: 'TextListField',
          invalidRegExp: '^' + Object.keys(Roles.RESERVED).join('|') + '$'
        }
      ]
    };

    this.set({
      schema
    });
  }

  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'roles');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'roles');
    return value === undefined ? super.getOne(name) : value;
  }
}
