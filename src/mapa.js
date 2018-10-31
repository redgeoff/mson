// Objects aren't ordered so we use an object and array so that we can key the values while
// maintaining order. The Map construct in ES6 solves some of these problems, but doesn't deal with
// getting the next value--instead you have to get the entire list of values. Mapa implements some a
// similar API to Map, but adds some extra functionality.

// We use a doubly linked list so that we can easily delete an item and still iterate forward and
// reverse. The downside is that iteration is a little slower than using an array. An alternative
// approach is to use an array and delete (not splice) items and then mark those items as deleted.
// The downside is that these deletions leave tombstones so they are they will eventually add up.

// TODO:
// - Open source Mapa as its own project? Mention at
//   https://stackoverflow.com/a/5773972/2831606

import events from 'events';

export default class Mapa extends events.EventEmitter {
  constructor() {
    super();
    this.clear();
  }

  clear() {
    this._firstKey = null;
    this._lastKey = null;
    this._length = 0;
    this._items = {};
  }

  has(key) {
    return this._items[key] !== undefined;
  }

  _nullOrUndefined(value) {
    return value === undefined || value === null;
  }

  _insertBefore(key, value, beforeKey) {
    let prevKey = this._lastKey;

    if (!this._nullOrUndefined(beforeKey)) {
      this._throwIfMissing(beforeKey);
      prevKey = this._items[beforeKey].prevKey;
    } else {
      beforeKey = null;
    }

    // Create item that links backwards to the previous item
    const item = { key, prevKey, nextKey: beforeKey, value };

    // Are we appending?
    if (beforeKey === null) {
      // Is there a last item?
      if (this._lastKey !== null) {
        // Link the last item forward to out new item
        this._items[this._lastKey].nextKey = key;
      }

      // Update the _lastKey
      this._lastKey = key;
    } else {
      // Link the next item backwards to our new item
      this._items[beforeKey].prevKey = key;

      // Is there a previous item that needs to be linked forward to our new item?
      if (prevKey !== null) {
        this._items[prevKey].nextKey = key;
      }
    }

    // Add the new item
    this._items[key] = item;

    // Is this the 1st item?
    if (this._firstKey === null || beforeKey === this._firstKey) {
      this._firstKey = key;
    }

    // Increment our length counter
    this._length++;

    return item;
  }

  _insertAfter(key, value, afterKey) {
    let nextKey = this._firstKey;

    if (!this._nullOrUndefined(afterKey)) {
      this._throwIfMissing(afterKey);
      nextKey = this._items[afterKey].nextKey;
    } else {
      afterKey = null;
    }

    // Create item that links backwards to the previous item
    const item = { key, prevKey: afterKey, nextKey, value };

    // Are we prepending?
    if (afterKey === null) {
      // Is there a first item?
      if (this._firstKey !== null) {
        // Link the first item backward to out new item
        this._items[this._firstKey].prevKey = key;
      }

      // Update the _firstKey
      this._firstKey = key;
    } else {
      // Link the previous item forward to our new item
      this._items[afterKey].nextKey = key;

      // Is there a next item that needs to be linked backwards to our new item?
      if (nextKey !== null) {
        this._items[nextKey].prevKey = key;
      }
    }

    // Add the new item
    this._items[key] = item;

    // Is this the last item?
    if (this._lastKey === null || afterKey === this._lastKey) {
      this._lastKey = key;
    }

    // Increment our length counter
    this._length++;

    return item;
  }

  _insert(key, value, beforeKey, afterKey) {
    if (beforeKey !== undefined && afterKey !== undefined) {
      throw new Error('cannot specify both beforeKey and afterKey');
    }

    if (afterKey !== undefined) {
      return this._insertAfter(key, value, afterKey);
    } else {
      return this._insertBefore(key, value, beforeKey);
    }
  }

  _update(key, value, beforeKey, afterKey) {
    let item = this._items[key];

    // Is the item moving?
    if (
      (beforeKey !== undefined &&
        item.nextKey !== beforeKey &&
        beforeKey !== key) ||
      (afterKey !== undefined && item.prevKey !== afterKey && afterKey !== key)
    ) {
      this._delete(key);
      item = this._insert(key, value, beforeKey, afterKey);
    } else {
      // Update
      item.value = value;
    }

    return item;
  }

  set(key, value, beforeKey, afterKey) {
    let item = null;
    if (this._nullOrUndefined(key)) {
      throw new Error('key cannot be null or undefined');
    } else if (this.has(key)) {
      item = this._update(key, value, beforeKey, afterKey);
      this.emitChange('update', item);
    } else {
      item = this._insert(key, value, beforeKey, afterKey);
      this.emitChange('create', item);
    }
    return item;
  }

  _throwIfMissing(key) {
    if (!this.has(key)) {
      throw new Error('value is missing for key ' + key);
    }
  }

  get(key) {
    this._throwIfMissing(key);
    return this._items[key].value;
  }

  *walkForward(key, fullEntry) {
    if (this.has(key)) {
      const item = this._items[key];
      if (fullEntry) {
        yield [key, item.value];
      } else {
        yield item.value;
      }

      // Is there another item?
      if (item.nextKey !== null) {
        yield* this.walkForward(item.nextKey, fullEntry);
      }
    }
  }

  *walkBackward(key, fullEntry) {
    if (this.has(key)) {
      const item = this._items[key];
      if (fullEntry) {
        yield [key, item.value];
      } else {
        yield item.value;
      }

      // Is there another item?
      if (item.prevKey !== null) {
        yield* this.walkBackward(item.prevKey, fullEntry);
      }
    }
  }

  *values(startKey, reverse) {
    if (reverse) {
      yield* this.walkBackward(startKey ? startKey : this._lastKey);
    } else {
      yield* this.walkForward(startKey ? startKey : this._firstKey);
    }
  }

  *entries(startKey, reverse) {
    if (reverse) {
      yield* this.walkBackward(startKey ? startKey : this._lastKey, true);
    } else {
      yield* this.walkForward(startKey ? startKey : this._firstKey, true);
    }
  }

  forEach(onValue) {
    for (const entry of this.entries()) {
      const last = entry[0] === this._lastKey;
      let again = onValue(entry[1], entry[0], last);

      // Do we need to exit prematurely?
      if (again === false) {
        break;
      }
    }
  }

  // Alias for forEach
  each(onValue) {
    this.forEach(onValue);
  }

  map(onValue) {
    let values = [];
    this.forEach((value, key) => {
      values.push(onValue(value, key));
    });
    return values;
  }

  _delete(key) {
    this._throwIfMissing(key);

    const item = this._items[key];

    // Are we sandwiched between items?
    if (item.prevKey !== null && item.nextKey !== null) {
      // Point the surrounding items to each other
      const prevItem = this._items[item.prevKey];
      const nextItem = this._items[item.nextKey];
      prevItem.nextKey = item.nextKey;
      nextItem.prevKey = item.prevKey;
    } else {
      // Are we deleting the 1st item?
      if (item.prevKey === null) {
        // Is there a next item?
        if (item.nextKey !== null) {
          // The nextItem no longer has a previous item
          const nextItem = this._items[item.nextKey];
          nextItem.prevKey = null;
        }

        // Pick the next item as the first item
        this._firstKey = item.nextKey;
      }

      // Are we deleting the last item?
      if (item.nextKey === null) {
        // Is there a previous item?
        if (item.prevKey !== null) {
          // The prevItem no longer has a next item
          const prevItem = this._items[item.prevKey];
          prevItem.nextKey = null;
        }

        // Pick the previous item as the last item
        this._lastKey = item.prevKey;
      }
    }

    // Decrement the length
    this._length--;

    // Delete the item
    delete this._items[key];

    return item;
  }

  emitChange(name, value) {
    this.emit(name, value);
    this.emit('$change', name, value);
  }

  delete(key) {
    const item = this._delete(key);
    this.emitChange('delete', item);
    return item;
  }

  length() {
    return this._length;
  }

  previousKey(key) {
    this._throwIfMissing(key);
    return this._items[key].prevKey;
  }

  previous(key) {
    return this.get(this.previousKey(key));
  }

  first() {
    return this.get(this._firstKey);
  }

  firstKey() {
    return this._firstKey;
  }

  hasFirst() {
    return this.has(this._firstKey);
  }

  isEmpty() {
    return !this.hasFirst();
  }

  nextKey(key) {
    this._throwIfMissing(key);
    return this._items[key].nextKey;
  }

  next(key) {
    return this.get(this.nextKey(key));
  }

  last() {
    return this.get(this._lastKey);
  }

  lastKey() {
    return this._lastKey;
  }

  hasLast() {
    return this.has(this._lastKey);
  }

  // // FUTURE: we could speed this up by creating an index for the indexes
  // indexOf(key) {
  //   let index = 0;
  //   for (const entry of this.entries()) {
  //     if (entry[0] === key) {
  //       return index;
  //     }
  //     index++;
  //   }
  // }
}
