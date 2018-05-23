// TODO: incorporate pieces of DocStore? How to make changes real-time?

import Component from './component';
import utils from './utils';
import registrar from './compiler/registrar';
import globals from './globals';

export default class RecordStore extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
  }

  getOne(name) {
    const value = this._getIfAllowed(name, 'type');
    return value === undefined ? super.getOne(name) : value;
  }

  async _request(props, promiseFactory) {
    const appId = globals.get('appId');

    try {
      const response = await promiseFactory(appId);
      return response;
    } catch (err) {
      utils.setFormErrorsFromAPIError(err, props.form);

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }

  async create(props) {
    return this._request(props, appId => {
      return registrar.client.record.create({
        appId,
        componentName: this.get('type'),
        fieldValues: props.form.get('value')
      });
    });
  }

  async getAll(props) {
    return this._request(props, appId => {
      return registrar.client.record.getAll({
        appId,
        componentName: this.get('type'),
        asArray: true
      });
    });
  }

  async update(props) {
    return this._request(props, appId => {
      return registrar.client.record.update({
        appId,
        componentName: this.get('type'),
        id: props.id,
        fieldValues: props.form.getValues()
      });
    });
  }

  async archive(props) {}
}
