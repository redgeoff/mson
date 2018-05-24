import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class LogInToApp extends Action {
  async act(props) {
    const appId = globals.get('appId');

    const values = props.component.get('value');

    try {
      await registrar.client.user.logInToApp({
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
