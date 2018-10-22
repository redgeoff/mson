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

  async _tryAndHandleError(promiseFactory) {
    // Disable the error handling in the parent as the error handling will be done in _request
    return promiseFactory();
  }

  async _request({ form, promiseFactory }) {
    const appId = this._globals.get('appId');

    try {
      return await promiseFactory(appId);
    } catch (err) {
      if (form) {
        this._uberUtils.setFormErrorsFromAPIError(err, form);
      } else {
        this._uberUtils.displayError(err.toString());
      }

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }

  async _createDoc({ form, fieldValues }) {
    this._clearCache();

    const response = await this._request({
      form,
      promiseFactory: appId => {
        return this._registrar.client.record.create({
          appId,
          componentName: this.get('storeName'),
          fieldValues
        });
      }
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

  async _getAllDocs({
    form,
    where,
    showArchived,
    after,
    first,
    before,
    last,
    order
  }) {
    const showArchivedWhere = this._getShowArchivedWhere(showArchived);
    where = utils.combineWheres(showArchivedWhere, where);

    return this._request({
      form,
      promiseFactory: async appId => {
        const opts = {
          appId,
          componentName: this.get('storeName'),
          asArray: true,
          where,
          after: after,
          first: first,
          before: before,
          last: last,
          order: order
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
      }
    });
  }

  async _updateDoc({ form, id, fieldValues }) {
    const response = await this._request({
      form,
      promiseFactory: appId => {
        return this._registrar.client.record.update({
          appId,
          componentName: this.get('storeName'),
          id,
          fieldValues
        });
      }
    });

    return response.data.updateRecord;
  }

  async _getDoc({ form, id, where }) {
    const response = await this._request({
      form,
      promiseFactory: appId => {
        return this._registrar.client.record.get({
          appId,
          componentName: this.get('storeName'),
          id,
          where
        });
      }
    });

    return response.data.record;
  }

  async getDoc(props) {
    return this._getDoc(props);
  }

  // TODO: refactor out after upsert is supported by API. Note: this is not a high priority as the
  // cache keeps us from hitting the API in many cases.
  async _upsertDoc(props) {
    const id = props.id;

    let exists = false;

    if (id) {
      try {
        await this._getDoc({ id });
        exists = true;
      } catch (err) {
        if (err.message === 'GraphQL error: record not found') {
          // Do nothing as record doesn't exist
        } else {
          throw err;
        }
      }
    }

    if (exists) {
      return this.updateDoc(props);
    } else {
      return this.createDoc(props);
    }
  }

  async _archiveDoc({ form, id }) {
    this._clearCache();

    const response = await this._request({
      form,
      promiseFactory: appId => {
        return this._registrar.client.record.archive({
          appId,
          componentName: this.get('storeName'),
          id
        });
      }
    });

    return response.data.archiveRecord;
  }

  async _restoreDoc({ form, id }) {
    this._clearCache();

    const response = await this._request({
      form,
      promiseFactory: appId => {
        return this._registrar.client.record.restore({
          appId,
          componentName: this.get('storeName'),
          id
        });
      }
    });

    return response.data.restoreRecord;
  }
}
