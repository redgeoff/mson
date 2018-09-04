// TODO: move access-layer stuff to Store base class and refactor record-store to use it

import Component from '../component';
import utils from '../utils';
import access from '../access';
import Mapa from '../mapa';

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
      // userId, // TODO
      fieldValues
    };

    this._items.set(fieldValues.id, item);

    return item;
  }

  async getAll(props) {
    // TODO:
    // props.showArchived
    // props.after
    // props.first
    // props.before
    // props.last
    // props.order

    const items = { edges: [] };
    for (const item of this._items.values()) {
      items.edges.push({
        node: {
          fieldValues: item.fieldValues
        }
      });
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
  }

  async archive(props) {
    const item = this._items.get(props.id);

    item.archivedAt = new Date();

    this._items.set(props.id, item);
  }

  async restore(props) {
    const item = this._items.get(props.id);

    delete item.archivedAt;

    this._items.set(props.id, item);
  }
}
