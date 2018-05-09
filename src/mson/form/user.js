import Form from './form';
import MSONComponent from '../component/mson-component';

export default class User extends Form {
  _setDefaultFields() {
    super._setDefaultFields();

    this._defaultFields.set(
      'username',
      new MSONComponent({
        definition: {
          component: 'EmailField',
          name: 'username',
          label: 'Username',
          required: true
        }
      })
    );

    this._defaultFields.set(
      'password',
      new MSONComponent({
        definition: {
          component: 'PasswordField',
          name: 'password',
          label: 'Password',
          required: true
        }
      })
    );
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
