// TODO: incorporate pieces of DocStore? How to make changes real-time?

import Component from './component';
import utils from './utils';
import registrar from './compiler/registrar';
import globals from './globals';
import access from './access';

export default class RecordStore extends Component {
  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'type',
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
    const appId = globals.get('appId');

    try {
      const response = await promiseFactory(appId);
      return response;
    } catch (err) {
      if (props && props.form) {
        utils.setFormErrorsFromAPIError(err, props.form);
      } else {
        utils.displayError(err.toString());
      }

      // We throw the error so that the entire listener chain is aborted
      throw err;
    }
  }

  async create(props) {
    this._clearCache();

    // Omit values based on access
    const fieldValues = access.valuesCanCreate(props.form);

    return this._request(props, appId => {
      return registrar.client.record.create({
        appId,
        componentName: this.get('type'),
        fieldValues
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
    const showArchivedWhere =
      props && props.showArchived
        ? { archivedAt: { $ne: null } }
        : { archivedAt: null };
    const where = utils.combineWheres(showArchivedWhere, props.where);

    return this._request(props, appId => {
      const opts = {
        appId,
        componentName: this.get('type'),
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
      // there a better way?
      if (!this._inCache(opts)) {
        this._addToCache(opts);
        opts.bypassCache = true;
      }

      return registrar.client.record.getAll(opts);
    });
  }

  async update(props) {
    // Omit values based on access
    const fieldValues = access.valuesCanUpdate(props.form);

    return this._request(props, appId => {
      return registrar.client.record.update({
        appId,
        componentName: this.get('type'),
        id: props.id,
        fieldValues
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
