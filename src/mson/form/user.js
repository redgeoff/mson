import Form from './form';
import MSONComponent from '../component/mson-component';

export default class User extends Form {
  _createDefaultFields() {
    super._createDefaultFields();

    this.addField(
      new MSONComponent({
        definition: {
          component: 'EmailField',
          name: 'username',
          label: 'Username',
          required: true
        }
      })
    );

    this.addField(
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
