import Action from './action';
import utils from '../utils';

export default class GenerateUUID extends Action {
  className = 'GenerateUUID';

  async act() {
    return utils.uuid();
  }
}
