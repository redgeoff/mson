import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class GetRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'where');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'where');
    return value === undefined ? super.getOne(name) : value;
  }

  _recordGet(props) {
    return registrar.client.record.get(props);
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      const record = await this._recordGet({
        appId,
        componentName: this.get('type'),
        where: this.get('where')
      });

      return record.data.record;
    } catch (err) {
      utils.displayError(err.toString());

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
