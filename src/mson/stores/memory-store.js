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

    this._items = new Mapa();

    this._items.on('$change', (name, value) => {
      this.emitChange(name + 'Item', value);
    });
  }

  async _createItem(props, fieldValues) {
    const item = this._buildDoc({ fieldValues });

    this._items.set(item.id, item);

    return item;
  }

  _toSiftWhere(where) {
    return cloneDeepWith(where, (item, index) => {
      if (item.$iLike) {
        return { $regex: '^' + item.$iLike.replace(/%/, ''), $options: 'i' };
      }
    });
  }

  async _getItem(props) {
    return this._items.get(props.id);
  }

  async _getAllItems(props) {
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

    const items = {
      // TODO: hasNextPage will need to change once we support pagination via after, first, etc...
      // depending on if there is still more data to get
      pageInfo: {
        hasNextPage: false
      },
      edges: []
    };

    for (const item of this._items.values()) {
      const sifted = where ? sift(where, [item]) : null;
      if (
        (props.showArchived === null ||
          !!item.archivedAt === props.showArchived) &&
        (where === null || sifted.length !== 0)
      ) {
        items.edges.push({
          node: item
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
      items.edges = orderBy(items.edges, names, orders);
    }

    return items;
  }

  async _updateItem(props, fieldValues) {
    // Clone the data so that we don't modify the original
    let item = cloneDeep(this._items.get(props.id));

    item = this._setDoc(item, { fieldValues });

    this._items.set(props.id, item);

    return item;
  }

  async _archiveItem(props) {
    // Clone the data so that we don't modify the original
    let item = cloneDeep(this._items.get(props.id));

    item = this._setDoc(item, { archivedAt: new Date() });

    this._items.set(props.id, item);

    return item;
  }

  async _restoreItem(props) {
    // Clone the data so that we don't modify the original
    let item = cloneDeep(this._items.get(props.id));

    item = this._setDoc(item, { archivedAt: null });

    this._items.set(props.id, item);

    return item;
  }
}
