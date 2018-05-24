import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class CreateRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type');
    return value === undefined ? super.getOne(name) : value;
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      await registrar.client.record.create({
        appId,
        componentName: this.get('type'),
        fieldValues: props.component.get('value')
      });

      // TODO: What to do with the created data?
    } catch (err) {
      utils.setFormErrorsFromAPIError(err, props.component);

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
