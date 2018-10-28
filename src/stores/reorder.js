// Does a single pass of all the items, moving an item and reordering any items that need to be
// reordered. We iterate through all the items to provide fault tolerance against race conditions.
// Typically, items won't be moving too far so race conditions should be infrequent. Moving an item
// from the top of the list, including archiving an item, does require updating all items.
export class Reorder {
  // We use a value of -1 instead of null as you cannot paginate a SQL DB with null values, i.e.
  // `WHERE order>NULL` does not work in this way.
  static DEFAULT_ORDER = -1;

  _handleReorder(item, newOrder, onReorder) {
    if (item.order !== newOrder) {
      return onReorder(item, newOrder);
    }
  }

  reorderItem(item, id, newOrder, i, destinationKey, onReorder) {
    let afterReordered = null;

    if (i === newOrder && newOrder !== this.constructor.DEFAULT_ORDER) {
      // We have reached the new order so skip this i as it will be used by the item being moved
      i++;

      destinationKey = item.id;
    }

    if (item.id === id) {
      // This item is the target item so reorder it
      afterReordered = this._handleReorder(item, newOrder, onReorder);
    } else if (
      item.order !== this.constructor.DEFAULT_ORDER ||
      !item.archivedAt
    ) {
      // We inspect archivedAt because we want to be able to turn on ordering at any time

      // Set the order based on the current i
      afterReordered = this._handleReorder(item, i, onReorder);
      i++;
    }

    return {
      i,
      destinationKey,
      afterReordered
    };
  }

  reorder(items, id, newOrder, onReorder) {
    let i = 0;

    let destinationKey = null;

    items.forEach(item => {
      const result = this.reorderItem(
        item,
        id,
        newOrder,
        i,
        destinationKey,
        onReorder
      );
      i = result.i;
      destinationKey = result.destinationKey;
    });

    return {
      destinationKey
    };
  }
}

export default new Reorder();
