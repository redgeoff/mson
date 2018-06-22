import Form from './form';
import MSONComponent from '../component/mson-component';
import Roles from '../roles';
import Set from '../actions/set';

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

    const listeners = [
      {
        event: 'willCreateRecord',
        actions: [
          new Set({
            name: 'fields.password.hidden',
            value: false
          }),
          new Set({
            name: 'fields.password.out',
            value: true
          }),
          new Set({
            name: 'fields.password.required',
            value: true
          })
        ]
      },
      {
        event: 'doneEditingRecord',
        actions: [
          new Set({
            name: 'fields.password.hidden',
            value: true
          }),
          new Set({
            name: 'fields.password.out',
            value: false
          }),
          new Set({
            name: 'fields.password.required',
            value: false
          })
        ]
      }
    ];

    this.set({
      schema,
      listeners
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
