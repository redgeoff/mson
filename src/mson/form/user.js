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
          required: true,
          forbidSort: true // TODO: enable once can sort
          // in: false,
          // out: false
        }
      })
    );

    this.addField(
      new MSONComponent({
        definition: {
          component: 'PasswordField',
          name: 'password',
          label: 'Password',
          required: true,
          in: false,
          out: false
        }
      })
    );

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'roles',
            component: 'TextListField',
            invalidRegExp: '^' + Object.keys(Roles.RESERVED).join('|') + '$'
          }
        ]
      }
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
