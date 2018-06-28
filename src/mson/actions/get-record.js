import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class GetRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'id');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'id');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    const appId = globals.get('appId');

    const record = await registrar.client.record.get({
      appId,
      componentName: this.get('type'),
      id: this.get('id')
    });

    return record.data.record;
  }
}
