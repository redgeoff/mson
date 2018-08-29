import Action from './action';
import uberUtils from '../uber-utils';

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
    return this._access.valuesCanUpdate(component);
  }

  _recordUpdate(props) {
    return this._registrar.client.record.update(props);
  }

  _valuesCanCreate(component) {
    return this._access.valuesCanCreate(component);
  }

  _recordCreate(props) {
    return this._registrar.client.record.create(props);
  }

  async act(props) {
    const appId = this._globals.get('appId');

    return uberUtils.tryAndSetFormErrorsIfAPIError(async () => {
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
    }, props.component);
  }
}
