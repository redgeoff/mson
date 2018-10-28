// Does a single pass of all the items, moving an item and reordering any items that need to be
// reordered. We iterate through all the items to provide fault tolerance against race conditions.
// Typically, items won't be moving too far so race conditions should be infrequent. Moving an item
// from the top of the list, including archiving an item, does require updating all items.
export default class Reorder {
  _handleReorder(item, newOrder, onReorder) {
    if (item.order !== newOrder) {
      onReorder(item, newOrder);
    }
  }

  reorder(items, id, newOrder, onReorder) {
    let i = 0;

    let destinationKey = null;

    items.forEach(item => {
      if (i === newOrder && newOrder !== null) {
        // We have reached the new order so skip this i as it will be used by the item being moved
        i++;

        destinationKey = item.id;
      }

      if (item.id === id) {
        // This item is the target item so reorder it
        this._handleReorder(item, newOrder, onReorder);
      } else if (item.order !== null) {
        // Set the order based on the current i
        this._handleReorder(item, i, onReorder);
        i++;
      }
    });

    return {
      destinationKey
    };
  }
}
