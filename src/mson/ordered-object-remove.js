// Objects aren't ordered so we use an object and array so that we can key the values while
// maintaining order. The Map construct in ES6 solves some of these problems, but doesn't deal with
// getting the "next" item.

// TODO:
// - Would it be simplier to always deal with keys and then enable things like nextKey(key). This
//   way, index is just a hidden implementation detail.
// - Open source OrderedObject as its own project? Mention at
//   https://stackoverflow.com/a/5773972/2831606

import _ from 'lodash';

export default class OrderedObject {
  constructor() {
    this.clear();
  }

  clear() {
    this._orderedItems = [];
    this._items = {};
  }

  add(key, item) {
    const itm = { key, index: this._orderedItems.length, item };
    this._orderedItems.push(itm);
    this._items[key] = itm;
  }

  _get(key, index) {
    const item =
      key === undefined ? this._orderedItems[index] : this._items[key];
    return item ? item : undefined;
  }

  get(key, index) {
    const item = this._get(key, index);
    return item ? item.item : undefined;
  }

  exists(key, index) {
    const item = this._get(key, index);
    return item && !item.removed ? true : false;
  }

  each(onItem) {
    const lastIndex = this.lastIndex();

    // Use _.each() so that we can return false to exit loop prematurely
    _.each(this._orderedItems, (item, index) => {
      // Does the item still exist?
      if (!item.removed) {
        return onItem(item.item, index, index === lastIndex);
      }
    });
  }

  map(onItem) {
    // We can't use map as the item may have been deleteed
    //
    // return this._orderedItems.map(onItem);

    let values = [];
    this.each((item, index, last) => {
      values.push(onItem(item, index, last));
    });
    return values;
  }

  firstIndex(index) {
    if (index === undefined) {
      index = 0;
    }

    if (this.removed(undefined, index)) {
      return this.firstIndex(index + 1);
    } else {
      return index;
    }
  }

  first() {
    const index = this.firstIndex();
    const item = this._orderedItems[index];
    return item ? item.item : undefined;
  }

  lastIndex(index) {
    if (index === undefined) {
      index = this._orderedItems.length - 1;
    }

    if (this.removed(undefined, index)) {
      return this.lastIndex(index - 1);
    } else {
      return index;
    }
  }

  last() {
    const index = this.lastIndex();
    const item = this._orderedItems[index];
    return item ? item.item : undefined;
  }

  index(key) {
    return this._items[key].index;
  }

  key(index) {
    return this._orderedItems[index].key;
  }

  remove(key, index) {
    // We remove the item and set the removed state so that we can later determine if the item was
    // removed. The item is shared memory so we only have to update it in a single place.
    const item = this._get(key, index);
    delete item.item;
    item.removed = true;
  }

  removed(key, index) {
    const item = this._get(key, index);
    return item ? item.removed : false;
  }

  // TODO: optimize by caching length and updating it when item added or removed
  length() {
    let len = 0;
    this.each(item => {
      if (!item.removed) {
        len++;
      }
    });
    return len;
  }
}
