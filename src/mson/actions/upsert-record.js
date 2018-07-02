import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import utils from '../utils';
import access from '../access';

export default class UpsertRecord extends Action {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type', 'id');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type', 'id');
    return value === undefined ? super.getOne(name) : value;
  }

  _fieldsCanUpdate(component) {
    return access.fieldsCanUpdate(component);
  }

  _recordUpdate(props) {
    return registrar.client.record.update(props);
  }

  _fieldsCanCreate(component) {
    return access.fieldsCanCreate(component);
  }

  _recordCreate(props) {
    return registrar.client.record.create(props);
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      const id = props.component.getValue('id');
      if (id) {
        const fieldValues = this._fieldsCanUpdate(props.component);

        await this._recordUpdate({
          appId,
          componentName: this.get('type'),
          id,
          fieldValues
        });
      } else {
        const fieldValues = this._fieldsCanCreate(props.component);

        await this._recordCreate({
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
