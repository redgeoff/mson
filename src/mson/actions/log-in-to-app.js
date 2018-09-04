import Action from './action';

export default class LogInToApp extends Action {
  _className = 'LogInToApp';

  async act(props) {
    const appId = this._globals.get('appId');

    const values = props.component.get('value');

    try {
      await this._registrar.client.user.logInToApp({
        appId,
        username: values.username,
        password: values.password
      });
    } catch (err) {
      // Assume this is an "invalid username or password"
      props.component.getField('password').setErr('invalid email or password');
      throw err;
    }
  }
}
