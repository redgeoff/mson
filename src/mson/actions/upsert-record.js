import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';

export default class UpsertRecord extends Action {
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

    try {
      const fieldValues = props.component.getValues({ out: true });
      if (this.get('id')) {
        await registrar.client.record.update({
          appId,
          componentName: this.get('type'),
          id: this.get('id'),
          fieldValues
        });
      } else {
        await registrar.client.record.create({
          appId,
          componentName: this.get('type'),
          fieldValues
        });
      }

      // TODO: What to do with the created/updated data?
    } catch (err) {
      utils.setFormErrorsFromAPIError(err, props.component);

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
