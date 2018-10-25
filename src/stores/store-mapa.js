import Mapa from '../mapa';

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

  _findBeforeId(order) {
    for (const entry of this.entries()) {
      const entryOrder = this._getProp(entry[1], 'order');
      if (
        entryOrder === undefined ||
        entryOrder === null ||
        entryOrder >= order
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

    let order = this._getProp(doc, 'order');
    let beforeId = undefined;
    if (order !== undefined && order !== null) {
      beforeId = this._findBeforeId(order);
    }

    const setDoc = super.set(id, doc, beforeId);

    if (beforeId !== null && beforeId !== undefined) {
      // Update subsequent orders
      for (const entry of this.entries(setDoc.nextKey)) {
        const value = entry[1];
        this._setProp(value, 'order', ++order);
        super.set(entry[0], value);
        if (onReorder) {
          onReorder(entry[0], value);
        }
      }
    }

    return setDoc;
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

  move(sourceIndex, destinationIndex, doc, onReorder) {
    // Note: the Mapa does not provide sequential indexes so we have to loop through all the items.
    // In general, we shouldn't be using _move() with large data sets as moving with beforeKey is
    // far more efficient. If we need to improve performance for larger datasets in the future, we
    // can store sequential indexes in Mapa.

    // The endIndex defines the end of the set that needs to be modified
    let endIndex = null;

    // The beginReorderIndex and endRedorderIndex define the set that needs to be reordered after
    // the doc is moved
    let beginReorderIndex = null;
    let endRedorderIndex = null;

    let docId = null;

    // Are we removing the doc, e.g. archiving it?
    let newOrder = destinationIndex;
    if (destinationIndex === null) {
      // Move it to the end, but set newOrder to null
      destinationIndex = this.length() - 1;
    }

    const movingDown = destinationIndex > sourceIndex;
    if (movingDown) {
      endIndex = destinationIndex;
      beginReorderIndex = sourceIndex + 1;
      endRedorderIndex = destinationIndex;
    } else {
      endIndex = sourceIndex;
      beginReorderIndex = destinationIndex;
      endRedorderIndex = sourceIndex - 1;
    }

    let beforeKey = movingDown ? undefined : null;
    let afterKey = movingDown ? null : undefined;

    // Build a list of all the affected entries. This is done before making any updates as the
    // updates will actually modify the underlying Mapa.
    const entries = [];
    let index = 0;
    for (const entry of this.entries()) {
      if (index >= beginReorderIndex && index <= endRedorderIndex) {
        entries.push(entry);
      }

      if (movingDown) {
        if (index === destinationIndex) {
          afterKey = entry[0];
        }
      } else if (index === destinationIndex) {
        beforeKey = entry[0];
      }

      if (index === sourceIndex) {
        docId = entry[0];
        if (doc === undefined) {
          doc = entry[1];
        }
      }

      if (index === endIndex) {
        // Exit the loop, the rest of the items are unaffected
        break;
      }

      index++;
    }

    // Move the doc
    this._setProp(doc, 'order', newOrder);
    super.set(docId, doc, beforeKey, afterKey);

    // Adjust order property of all affected docs
    entries.forEach((entry, i) => {
      const order = i + beginReorderIndex + (movingDown ? -1 : 1);

      const item = entry[1];
      this._setProp(item, 'order', order);
      const id = entry[0];

      // Use super.set() so that we force item to stay in the same place. This prevents us from
      // traversing the list to find the correct place to move the item as the order property is
      // changing
      super.set(id, item);
      if (onReorder) {
        onReorder(id, item);
      }
    });

    return doc;
  }

  _findSourceAndDestinationIndexes(id, newDoc) {
    // Note: we use a more resilent way than just using the existingOrder and newOrder for the
    // destinationIndex as race conditions can result in duplicate "order" values

    // const sourceIndex = this._getProp(existingDoc, 'order');
    // const destinationIndex = this._getProp(newDoc, 'order');

    const newOrder = this._getProp(newDoc, 'order');

    let sourceIndex = null;
    let destinationIndex = null;
    let index = 0;
    for (const entry of this.entries()) {
      const entryId = entry[0];
      const entryOrder = this._getProp(entry[1], 'order');

      if (entryId === id) {
        sourceIndex = index;
      }

      if (
        destinationIndex === null &&
        newOrder !== null &&
        newOrder <= entryOrder
      ) {
        destinationIndex = index;
      }

      if (sourceIndex !== null && destinationIndex !== null) {
        // Exit loop as source and destination have been found
        break;
      }

      index++;
    }

    if (destinationIndex === null && newOrder !== null) {
      // Move to the end
      destinationIndex = this.length() - 1;
    }

    return {
      sourceIndex,
      destinationIndex
    };
  }

  _updateAndReorderInDocs(id, doc, onReorder) {
    const existingDoc = this.get(id);

    const existingOrder = this._getProp(existingDoc, 'order');
    const newOrder = this._getProp(doc, 'order');

    if (existingOrder === newOrder) {
      // Just update the doc as the order isn't changing so we don't need to incur any extra
      // overhead in reordering
      return this._updateInDocs(id, doc);
    } else {
      let {
        sourceIndex,
        destinationIndex
      } = this._findSourceAndDestinationIndexes(id, doc);
      return this.move(sourceIndex, destinationIndex, doc, onReorder);
    }
  }

  set(id, doc, beforeId, reorder, onReorder) {
    if (beforeId !== undefined) {
      return super.set(id, doc, beforeId);
    } else if (this.has(id)) {
      if (reorder) {
        return this._updateAndReorderInDocs(id, doc, onReorder);
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
