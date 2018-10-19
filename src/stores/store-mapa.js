import Mapa from '../mapa';

// Dynamically moves the docs when the order is adjusted
export default class StoreMapa extends Mapa {
  _getProp(doc, name) {
    return doc[name];
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

  _createInDocs(id, doc, beforeId) {
    if (beforeId === undefined) {
      beforeId = this.getBeforeId(doc);
    }

    return super.set(id, doc, beforeId);
  }

  _updateInDocs(id, doc, beforeId) {
    if (beforeId === undefined) {
      const existingDoc = this.get(id);

      // Is the order changing?
      if (this._getProp(doc, 'order') !== this._getProp(existingDoc, 'order')) {
        beforeId = this.getBeforeId(doc);
      }
    }

    return super.set(id, doc, beforeId);
  }

  set(id, doc, beforeId) {
    if (this.has(id)) {
      return this._updateInDocs(id, doc, beforeId);
    } else {
      return this._createInDocs(id, doc, beforeId);
    }
  }
}
