import Action from './action';
import registrar from '../compiler/registrar';

export default class LogOutOfApp extends Action {
  _logOutOfApp() {
    return registrar.client.user.logOutOfApp();
  }

  async act(props) {
    await this._logOutOfApp();
  }
}
