import Store from './store';
import StoreMapa from './store-mapa';
import cloneDeepWith from 'lodash/cloneDeepWith';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import sift from 'sift';
import { Reorder } from './reorder';

export default class MemoryStore extends Store {
  _className = 'MemoryStore';

  _create(props) {
    super._create(props);

    this._docs = new StoreMapa();

    this._docs.on('$change', (name, value) => {
      this.emitChange(name + 'Doc', value);
    });
  }

  _numUnarchived() {
    let n = 0;
    for (const value of this._docs.values()) {
      if (!value.archivedAt) {
        n++;
      }
    }
    return n;
  }

  async _createDoc({ fieldValues, id, order, reorder }) {
    if (this._shouldSetToLastOrder(order, reorder)) {
      order = this._numUnarchived();
    }

    const userId = this._getUserId();
    const doc = this._buildDoc({ fieldValues, id, order, userId });

    this._docs.set(doc.id, doc, undefined, undefined, true);

    return doc;
  }

  _toSiftWhere(where) {
    return cloneDeepWith(where, doc => {
      if (doc && doc.$iLike) {
        return { $regex: '^' + doc.$iLike.replace(/%/, ''), $options: 'i' };
      }
    });
  }

  async _hasDoc({ id }) {
    return this._docs.has(id);
  }

  async _getDoc({ id }) {
    return this._docs.get(id);
  }

  async _getAllDocs({ where, showArchived, order }) {
    // TODO: after, first, before, last and cursors in results

    if (where) {
      // Convert to a sift expression and then filter
      where = this._toSiftWhere(where);
    }

    const docs = {
      // TODO: hasNextPage will need to change once we support pagination via after, first, etc...
      // depending on if there is still more data to get
      pageInfo: {
        hasNextPage: false
      },
      edges: []
    };

    for (const doc of this._docs.values()) {
      const sifted = where === undefined ? null : sift(where, [doc]);
      if (
        (showArchived === null ||
          showArchived === undefined ||
          !!doc.archivedAt === showArchived) &&
        (where === undefined || sifted.length !== 0)
      ) {
        docs.edges.push({
          node: doc
        });
      }
    }

    if (order) {
      // Order by properties
      const names = [];
      const orders = [];
      order.forEach(order => {
        names.push('node.' + order[0]);
        orders.push(order[1].toLowerCase());
      });
      docs.edges = orderBy(docs.edges, names, orders);
    }

    return docs;
  }

  async _updateDoc({ id, fieldValues, order }) {
    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(id));

    doc = this._setDoc({ doc, fieldValues, order });

    this._docs.set(id, doc, undefined, undefined, true);

    return doc;
  }

  async _archiveDoc({ id }) {
    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(id));

    doc = this._setDoc({
      doc,
      archivedAt: this._now(),
      order: Reorder.DEFAULT_ORDER
    });

    this._docs.set(id, doc, undefined, undefined, true);

    return doc;
  }

  async _restoreDoc({ id, reorder, order }) {
    if (this._shouldSetToLastOrder(order, reorder)) {
      order = this._numUnarchived();
    }

    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(id));

    doc = this._setDoc({ doc, archivedAt: null, order });

    this._docs.set(id, doc, undefined, undefined, true);

    return doc;
  }
}
