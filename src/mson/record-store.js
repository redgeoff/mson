// TODO: incorporate pieces of DocStore? How to make changes real-time?

import Component from './component';
import utils from './utils';
import registrar from './compiler/registrar';
import globals from './globals';

export default class RecordStore extends Component {
  set(props) {
    super.set(props);
    this._setIfUndefined(props, 'type');
    this._clearCache();
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
    this._clearCache();
    return this._request(props, appId => {
      return registrar.client.record.create({
        appId,
        componentName: this.get('type'),
        fieldValues: props.form.get('value')
      });
    });
  }

  _clearCache() {
    this._cachedQueries = {};
  }

  _inCache(opts) {
    return this._cachedQueries[JSON.stringify(opts)] ? true : false;
  }

  _addToCache(opts) {
    this._cachedQueries[JSON.stringify(opts)] = true;
  }

  async getAll(props) {
    // TODO: what happens when we have where clauses defined in props? Should we also support a
    // status prop like at the stils layer? If not, we can just generate a composite where. The
    // components API has a status so maybe this is the best?

    const where =
      props && props.showArchived ? undefined : { archivedAt: null };

    return this._request(props, appId => {
      const opts = {
        appId,
        componentName: this.get('type'),
        asArray: true,
        where
      };

      // The built-in apollo client cache cannot automatically accomodate the mutations so we use a
      // thin layer on top to clear the cache (invalidate it) when it needs to be rebuilt. In
      // particular this is needed when archiving/restoring and then toggling showArchived. TODO: is
      // there a better way?
      if (!this._inCache(opts)) {
        this._addToCache(opts);
        opts.bypassCache = true;
      }

      return registrar.client.record.getAll(opts);
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

  async archive(props) {
    this._clearCache();
    return this._request(props, appId => {
      return registrar.client.record.archive({
        appId,
        componentName: this.get('type'),
        id: props.id
      });
    });
  }

  async restore(props) {
    this._clearCache();
    return this._request(props, appId => {
      return registrar.client.record.restore({
        appId,
        componentName: this.get('type'),
        id: props.id
      });
    });
  }
}
