import Mapa from '../mapa';
import reorder, { Reorder } from './reorder';

// Dynamically moves the docs when the order is adjusted
export default class StoreMapa extends Mapa {
  _getProp(doc, name) {
    return doc[name];
  }

  _setProp(doc, name, value) {
    return (doc[name] = value);
  }

  // FUTURE: for small data sets, the only ones we expect to use with the ordering, it is relatively
  // quick to iterate through the items to find where to insert an item. If a speed increase is
  // needed, we could use a b-tree to find the correct place in logrithmic time.
  _findIdAfter(order) {
    for (const entry of this.entries()) {
      const entryOrder = this._getProp(entry[1], 'order');
      if (
        entryOrder === undefined ||
        entryOrder === null ||
        entryOrder > order
      ) {
        return entry[0];
      }
    }
    return null;
  }

  getBeforeId(doc) {
    if (this._getProp(doc, 'archivedAt')) {
      // Move to last
      return null;
    } else if (
      this._getProp(doc, 'order') === null ||
      this._getProp(doc, 'order') === undefined
    ) {
      // The order is unspecified
      return undefined;
    } else {
      // Iterate over the list to find the correct place to insert the new doc
      return this._findIdAfter(this._getProp(doc, 'order'));
    }
  }

  _createInDocs(id, doc) {
    const beforeId = this.getBeforeId(doc);
    return super.set(id, doc, beforeId);
  }

  _createInDocsAndReorder(id, doc, onReorder) {
    // Note: we don't inject `order=length() - 1` as we want the caller to be able to:
    // - Disable reordering by not specifying an order
    // - Set the order of the new item

    const order = this._getProp(doc, 'order');

    if (order === Reorder.DEFAULT_ORDER || order === undefined) {
      // Just create the doc as there is no order so we don't need to incur any extra overhead in
      // reordering
      return this._createInDocs(id, doc);
    } else {
      return this._reorder(id, doc, order, onReorder);
    }
  }

  _updateInDocs(id, doc) {
    let beforeId = undefined;

    const existingDoc = this.get(id);

    // Is the order changing?
    if (this._getProp(doc, 'order') !== this._getProp(existingDoc, 'order')) {
      beforeId = this.getBeforeId(doc);
    }

    return super.set(id, doc, beforeId);
  }

  keysAtIndexes(indexes) {
    const clonedIndexes = Object.assign([], indexes);
    let index = 0;
    const keys = {};
    for (const entry of this.entries()) {
      const i = clonedIndexes.indexOf(index);
      if (i !== -1) {
        keys[clonedIndexes[i]] = entry[0];
        if (clonedIndexes.length === 1) {
          // Exit loop as we found what we need
          break;
        } else {
          clonedIndexes.splice(i, 1);
        }
      }
      index++;
    }
    return keys;
  }

  _reorder(id, item, newOrder, onReorder) {
    const items = {
      forEach: callback => {
        this.forEach((item, id) => {
          callback({
            id,
            order: this._getProp(item, 'order'),
            archivedAt: this._getProp(item, 'archivedAt')
          });
        });
      }
    };

    const handleReorder = (item, newOrder) => {
      const itemId = this._getProp(item, 'id');

      // Make sure this is not the target item. We'll update the target item below once we've found
      // the destinationKey. We may need to iterate through all the items just to find the
      // destinationKey.
      if (itemId !== id) {
        const doc = this.get(itemId);
        this._setProp(doc, 'order', newOrder);
        super.set(itemId, doc);
        if (onReorder) {
          onReorder(itemId, doc);
        }
      }
    };

    const result = reorder.reorder(items, id, newOrder, handleReorder);

    this._setProp(item, 'order', newOrder);

    return super.set(id, item, result.destinationKey);
  }

  _updateInDocsAndReorder(id, doc, onReorder) {
    const existingDoc = this.get(id);

    const existingOrder = this._getProp(existingDoc, 'order');
    const newOrder = this._getProp(doc, 'order');

    if (existingOrder === newOrder) {
      // Just update the doc as the order isn't changing so we don't need to incur any extra
      // overhead in reordering
      return this._updateInDocs(id, doc);
    } else {
      return this._reorder(id, doc, newOrder, onReorder);
    }
  }

  set(id, doc, beforeId, afterId, reorder, onReorder) {
    if (beforeId !== undefined || afterId !== undefined) {
      return super.set(id, doc, beforeId, afterId);
    } else if (this.has(id)) {
      if (reorder) {
        return this._updateInDocsAndReorder(id, doc, onReorder);
      } else {
        return this._updateInDocs(id, doc);
      }
    } else {
      if (reorder) {
        return this._createInDocsAndReorder(id, doc, onReorder);
      } else {
        return this._createInDocs(id, doc);
      }
    }
  }
}
