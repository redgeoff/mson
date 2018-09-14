// TODO: make changes real time with subscriptions

import Store from './store';
import utils from '../utils';
import uberUtils from '../uber-utils';
import registrar from '../compiler/registrar';
import globals from '../globals';

export default class RecordStore extends Store {
  _className = 'RecordStore';

  _create(props) {
    super._create(props);

    // For mocking
    this._globals = globals;
    this._uberUtils = uberUtils;
    this._registrar = registrar;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField'
          }
        ]
      }
    });
  }

  set(props) {
    super.set(props);
    this._clearCache();
  }

  async _request(props, promiseFactory) {
    const appId = this._globals.get('appId');

    try {
      return await promiseFactory(appId);
    } catch (err) {
      if (props && props.form) {
        this._uberUtils.setFormErrorsFromAPIError(err, props.form);
      } else {
        this._uberUtils.displayError(err.toString());
      }

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }

  async _createDoc(props, fieldValues) {
    this._clearCache();

    const response = await this._request(props, appId => {
      return this._registrar.client.record.create({
        appId,
        componentName: this.get('storeName'),
        fieldValues
      });
    });

    return response.data.createRecord;
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

  _getShowArchivedWhere(showArchived) {
    return showArchived ? { archivedAt: { $ne: null } } : { archivedAt: null };
  }

  async _getAllDocs(props) {
    const showArchivedWhere = this._getShowArchivedWhere(
      props && props.showArchived
    );
    const where = utils.combineWheres(showArchivedWhere, props.where);

    return this._request(props, async appId => {
      const opts = {
        appId,
        componentName: this.get('storeName'),
        asArray: true,
        where,
        after: props.after,
        first: props.first,
        before: props.before,
        last: props.last,
        order: props.order
      };

      // The built-in apollo client cache cannot automatically accomodate the mutations so we use a
      // thin layer on top to clear the cache (invalidate it) when it needs to be rebuilt. In
      // particular this is needed when archiving/restoring and then toggling showArchived. TODO: is
      // there a better way? Using readQuery and writeQuery at the ApolloClient layer doesn't appear
      // to fix this issue.
      if (!this._inCache(opts)) {
        this._addToCache(opts);
        opts.bypassCache = true;
      }

      const response = await this._registrar.client.record.getAll(opts);
      return response.data.records;
    });
  }

  async _updateDoc(props, fieldValues) {
    const response = await this._request(props, appId => {
      return this._registrar.client.record.update({
        appId,
        componentName: this.get('storeName'),
        id: props.id,
        fieldValues
      });
    });

    return response.data.updateRecord;
  }

  async _archiveDoc(props) {
    this._clearCache();

    const response = await this._request(props, appId => {
      return this._registrar.client.record.archive({
        appId,
        componentName: this.get('storeName'),
        id: props.id
      });
    });

    return response.data.archiveRecord;
  }

  async _restoreDoc(props) {
    this._clearCache();

    const response = await this._request(props, appId => {
      return this._registrar.client.record.restore({
        appId,
        componentName: this.get('storeName'),
        id: props.id
      });
    });

    return response.data.restoreRecord;
  }
}
