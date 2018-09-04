import Action from './action';

export default class LogOutOfApp extends Action {
  _className = 'LogOutOfApp';

  _logOutOfApp() {
    return this._registrar.client.user.logOutOfApp();
  }

  async act(props) {
    await this._logOutOfApp();
  }
}
