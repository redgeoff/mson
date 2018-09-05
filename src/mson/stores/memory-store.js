// TODO: move access-layer stuff to Store base class and refactor record-store to use it

import Component from '../component';
import utils from '../utils';
import access from '../access';
import Mapa from '../mapa';
import cloneDeepWith from 'lodash/cloneDeepWith';
import orderBy from 'lodash/orderBy';
import sift from 'sift';

export default class MemoryStore extends Component {
  _className = 'MemoryStore';

  _create(props) {
    super._create(props);

    this._items = new Mapa();
  }

  async create(props) {
    // Omit values based on access
    const fieldValues = access.valuesCanCreate(props.form);

    const id = utils.uuid();
    fieldValues.id = id;
    const item = {
      id,
      archivedAt: null, // Needed by the UI as a default
      // userId, // TODO
      fieldValues
    };

    this._items.set(fieldValues.id, item);

    return item;
  }

  _toSiftWhere(where) {
    return cloneDeepWith(where, (item, index) => {
      if (item.$iLike) {
        return { $regex: '^' + item.$iLike.replace(/%/, ''), $options: 'i' };
      }
    });
  }

  async getAll(props) {
    console.log('getAll', { props });
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

    const items = { edges: [] };
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

  async update(props) {
    // Omit values based on access
    const fieldValues = access.valuesCanUpdate(props.form);

    const item = this._items.get(props.id);

    // Merge so that we support partial updates
    item.fieldValues = Object.assign(item.fieldValues, fieldValues);

    this._items.set(props.id, item);

    return item;
  }

  async archive(props) {
    const item = this._items.get(props.id);

    item.archivedAt = new Date();

    this._items.set(props.id, item);

    return item;
  }

  async restore(props) {
    const item = this._items.get(props.id);

    item.archivedAt = null;

    this._items.set(props.id, item);

    return item;
  }
}
