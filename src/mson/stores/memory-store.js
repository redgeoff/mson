import Store from './store';
import Mapa from '../mapa';
import cloneDeepWith from 'lodash/cloneDeepWith';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import sift from 'sift';

export default class MemoryStore extends Store {
  _className = 'MemoryStore';

  _create(props) {
    super._create(props);

    this._docs = new Mapa();

    this._docs.on('$change', (name, value) => {
      this.emitChange(name + 'Doc', value);
    });
  }

  async _createDoc(props, fieldValues) {
    const doc = this._buildDoc({ fieldValues });

    this._docs.set(doc.id, doc);

    return doc;
  }

  _toSiftWhere(where) {
    return cloneDeepWith(where, (doc, index) => {
      if (doc.$iLike) {
        return { $regex: '^' + doc.$iLike.replace(/%/, ''), $options: 'i' };
      }
    });
  }

  async _getDoc(props) {
    return this._docs.get(props.id);
  }

  async _getAllDocs(props) {
    // TODO:
    // props.after
    // props.first
    // props.before
    // props.last

    let where = null;

    if (props.where) {
      // Convert to a sift expression and then filter
      where = this._toSiftWhere(props.where);
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
      const sifted = where ? sift(where, [doc]) : null;
      if (
        (props.showArchived === null ||
          !!doc.archivedAt === props.showArchived) &&
        (where === null || sifted.length !== 0)
      ) {
        docs.edges.push({
          node: doc
        });
      }
    }

    if (props.order) {
      // Order by properties
      const names = [];
      const orders = [];
      props.order.forEach(order => {
        names.push('node.' + order[0]);
        orders.push(order[1].toLowerCase());
      });
      docs.edges = orderBy(docs.edges, names, orders);
    }

    return docs;
  }

  async _updateDoc(props, fieldValues) {
    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(props.id));

    doc = this._setDoc(doc, { fieldValues });

    this._docs.set(props.id, doc);

    return doc;
  }

  async _archiveDoc(props) {
    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(props.id));

    doc = this._setDoc(doc, { archivedAt: new Date() });

    this._docs.set(props.id, doc);

    return doc;
  }

  async _restoreDoc(props) {
    // Clone the data so that we don't modify the original
    let doc = cloneDeep(this._docs.get(props.id));

    doc = this._setDoc(doc, { archivedAt: null });

    this._docs.set(props.id, doc);

    return doc;
  }
}
