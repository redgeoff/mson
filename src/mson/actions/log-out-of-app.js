import Action from './action';
import registrar from '../compiler/registrar';

export default class LogOutOfApp extends Action {
  async act(props) {
    await registrar.client.user.logOutOfApp();
  }
}
