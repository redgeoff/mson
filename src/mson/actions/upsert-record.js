import Action from './action';
import registrar from '../compiler/registrar';
import globals from '../globals';
import uberUtils from '../uber-utils';
import access from '../access';

export default class UpsertRecord extends Action {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField',
            required: true
          },
          {
            name: 'id',
            component: 'TextField'
          }
        ]
      }
    });
  }

  _valuesCanUpdate(component) {
    return access.valuesCanUpdate(component);
  }

  _recordUpdate(props) {
    return registrar.client.record.update(props);
  }

  _valuesCanCreate(component) {
    return access.valuesCanCreate(component);
  }

  _recordCreate(props) {
    return registrar.client.record.create(props);
  }

  async act(props) {
    const appId = globals.get('appId');

    try {
      const id = props.component.getValue('id');
      if (id) {
        const fieldValues = this._valuesCanUpdate(props.component);

        await this._recordUpdate({
          appId,
          componentName: this.get('storeName'),
          id,
          fieldValues
        });
      } else {
        const fieldValues = this._valuesCanCreate(props.component);

        await this._recordCreate({
          appId,
          componentName: this.get('storeName'),
          fieldValues
        });
      }

      // TODO: What to do with the created/updated data?
    } catch (err) {
      uberUtils.setFormErrorsFromAPIError(err, props.component);

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }
}
