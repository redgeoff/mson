import Action from './action';
import utils from '../utils';

export default class GenerateUUID extends Action {
  _className = 'GenerateUUID';

  async act() {
    return utils.uuid();
  }
}
