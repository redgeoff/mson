// TODO: make changes real time with subscriptions

import Store from './store';
import utils from '../utils';
import uberUtils from '../uber-utils';
import registrar from '../compiler/registrar';
import reorder, { Reorder } from './reorder';

export default class RecordStore extends Store {
  _className = 'RecordStore';

  // Used to paginate the data when reordering so that we break up our batches
  static ITEMS_PER_PAGE_DEFAULT = 50;

  _create(props) {
    super._create(props);

    // For mocking
    this._uberUtils = uberUtils;
    this._registrar = registrar;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'storeName',
            component: 'TextField',
            required: true,
          },
        ],
      },
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

  async _createDoc({ form, fieldValues, order, reorder }) {
    this._clearCache();

    if (this._shouldSetToLastOrder(order, reorder)) {
      // Reorder and get the lastOrder so that we can add the new doc to the end of the list
      const result = await this._reorder({ form });
      order = result.lastOrder;
      fieldValues = Object.assign({}, fieldValues, { order });
    }

    const response = await this._request({
      form,
      promiseFactory: (appId) => {
        return this._registrar.client.record.create({
          appId,
          componentName: this.get('storeName'),
          fieldValues,
          order,
        });
      },
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
    if (showArchived === null) {
      return null;
    } else if (showArchived) {
      return { archivedAt: { $ne: null } };
    } else {
      return { archivedAt: null };
    }
  }

  async _getAllDocs({
    form,
    where,
    showArchived,
    after,
    first,
    before,
    last,
    order,
    searchString,
  }) {
    const showArchivedWhere = this._getShowArchivedWhere(showArchived);
    where = utils.combineWheres(showArchivedWhere, where, this.get('where'));

    return this._request({
      form,
      promiseFactory: async (appId) => {
        const opts = {
          appId,
          componentName: this.get('storeName'),
          asArray: true,
          where,
          after,
          first,
          before,
          last,
          order,
          showArchived,
          searchString,
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
      },
    });
  }

  async _reorder({ form, id, order }) {
    let loop = true;

    const props = {
      first: this.constructor.ITEMS_PER_PAGE_DEFAULT,
      order: [['order', 'asc']],
      where: this.get('where'),
    };

    const itemsToReorder = [];

    const onReorder = (item, newOrder) => {
      // Only reorder the affected items. The item being moved will be updated afterwards
      if (item.id !== id) {
        itemsToReorder.push({ id: item.id, order: newOrder });
      }
    };

    let i = 0;
    let destinationKey = null;

    while (loop) {
      const response = await this.getAllDocs(props);

      for (let j = 0; j < response.edges.length; j++) {
        const item = response.edges[j];
        const result = reorder.reorderItem(
          item.node,
          id,
          order,
          i,
          destinationKey,
          onReorder
        );
        i = result.i;
        destinationKey = result.destinationKey;
      }

      props.after = response.pageInfo.endCursor;

      loop = response.pageInfo.hasNextPage;
    }

    if (itemsToReorder.length > 0) {
      // We have to clear the cache as the order of the items has changed.
      this._clearCache();

      // We have to update the items after we get them all or else our updates can affect the order the
      // pagination results
      for (let j = 0; j < itemsToReorder.length; j++) {
        const { id, order } = itemsToReorder[j];

        // Set to blank as we are using partial updates and don't need to send all the data
        const fieldValues = {};

        await this._requestUpdate({ form, id, order, fieldValues });
      }
    }

    return {
      lastOrder: i,
    };
  }

  async _requestUpdate({ form, id, fieldValues, order }) {
    const response = await this._request({
      form,
      promiseFactory: (appId) => {
        return this._registrar.client.record.update({
          appId,
          componentName: this.get('storeName'),
          id,
          fieldValues,
          order,
        });
      },
    });

    return response.data.updateRecord;
  }

  async _updateDoc({ form, id, fieldValues, order, reorder }) {
    if (reorder) {
      await this._reorder({ form, id, order });
    }

    return this._requestUpdate({ form, id, fieldValues, order });
  }

  async _getDoc({ form, id, where }) {
    const response = await this._request({
      form,
      promiseFactory: (appId) => {
        return this._registrar.client.record.get({
          appId,
          componentName: this.get('storeName'),
          id,
          where,
        });
      },
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

  async _archiveDoc({ form, id, reorder }) {
    this._clearCache();

    const response = await this._request({
      form,
      promiseFactory: (appId) => {
        return this._registrar.client.record.archive({
          appId,
          componentName: this.get('storeName'),
          id,
        });
      },
    });

    if (reorder) {
      // Remove from ordered list and reorder affected docs. TODO: should we refactor archive so
      // that you can pass in values like order? This way, you can archive and reorder in a single
      // call.
      //
      // TODO: we don't await the _updateDoc() here as it can take a while to reorder all the docs
      // and we don't want it to take this long to confirm the deletion. Is there a better way? We
      // could:
      //   - Pass the where property to the back end so that the back end can perform the
      //     reordering. Would this be fast enough? The back end would still have to iterate through
      //     all the items.
      //   - Support batch updates. I'm not clear how much faster this would be though as we are
      //     already using web sockets and so there is less overhead per update.
      //   - If we stick with this detached construct (no await) then we should probably report any
      //     errors via an 'updateErr' event on the store
      this._updateDoc({
        form,
        id,
        order: Reorder.DEFAULT_ORDER,
        reorder: true,
        fieldValues: {},
      });
    }

    return response.data.archiveRecord;
  }

  async _restoreDoc({ form, id, order, reorder }) {
    this._clearCache();

    const response = await this._request({
      form,
      promiseFactory: (appId) => {
        return this._registrar.client.record.restore({
          appId,
          componentName: this.get('storeName'),
          id,
        });
      },
    });

    if (this._shouldSetToLastOrder(order, reorder)) {
      // Reorder and get the lastOrder so that we can move the restored doc to the end of the list
      const result = await this._reorder({ form, id });
      await this._updateDoc({
        form,
        id,
        fieldValues: {},
        order: result.lastOrder,
        reorder: false,
      });
    }

    return response.data.restoreRecord;
  }
}
