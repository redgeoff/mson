import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class GetRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'where');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'where');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    const appId = globals.get('appId');

    const record = await registrar.client.record.get({
      appId,
      componentName: this.get('type'),
      where: this.get('where')
    });

    return record.data.record;
  }
}
