// Properties in an object aren't ordered. The Map construct in ES6 addresses this issue, but it
// doesn't allow you to modify the order of the items or insert items anywhere but at the end of the
// list. Mapa implements an API similar to Map, but adds some extra functionality. We use a
// doubly-linked list so that we can easily define an orderable list, while providing the ability to
// reference items by keys.

// TODO:
// - Open source Mapa as its own project? Mention at
//   https://stackoverflow.com/a/5773972/2831606

import events from 'events';

export type Key = string | number | undefined | null;

type FullEntry<V> = [Key, V];

type Entry<V> = V | FullEntry<V>;

type ItemGenerator<V> = Generator<Entry<V>, void>;

type ValueGenerator<V> = Generator<V, void>;

type FullEntryGenerator<V> = Generator<FullEntry<V>, void>;

export type OnValue<V, U> = (
  value?: V,
  key?: Key,
  last?: boolean
) => boolean | U | void;

export type MapOnValue<V, U> = (value?: V, key?: Key, last?: boolean) => U;

export interface Item<V> {
  key: Key;
  prevKey: Key;
  nextKey: Key;
  value: V;
}

// We use an object instead of a Map as an object can be cloned with deepClone, but a Map cannot.
// In testing with Map we found that errors like the following where being thrown by
// BaseComponent._cloneSlow(), "Method Map.prototype.has called on incompatible receiver".
type Items<V> = {
  // Note: currently an index signature property must be a string or number
  // (https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures). Therefore, we
  // cannot support generic keys
  [key: string]: Item<V>;
};

export default class Mapa<V> extends events.EventEmitter {
  private _firstKey!: Key;
  private _lastKey!: Key;
  private _length!: number;

  // This member is protected so that our tests can better inspect that the state is being set
  // properly. This is a bit a of an anti-pattern so in the future, we may choose to make this
  // private and refactor our tests.
  protected _items!: Items<V>;

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

  protected _getItem(key: Key) {
    if (key === undefined || key === null) {
      return undefined;
    } else {
      return this._items[key];
    }
  }

  protected _throwKeyFalsyError() {
    throw new Error('key cannot be null or undefined');
  }

  protected _setItem(key: Key, item: Item<V>) {
    if (key === undefined || key === null) {
      this._throwKeyFalsyError();
    } else {
      this._items[key] = item;
    }
  }

  protected _deleteItem(key: Key) {
    if (key === undefined || key === null) {
      this._throwKeyFalsyError();
    } else {
      delete this._items[key];
    }
  }

  has(key: Key) {
    return this._getItem(key) !== undefined;
  }

  private _nullOrUndefined(value: Key) {
    return value === undefined || value === null;
  }

  private _getOrThrow(key: Key) {
    // Note: we use items.get() and check for undefined instead of using items.has() so that this
    // provides a guard for TypeScript
    const item = this._getItem(key);
    if (item === undefined) {
      throw new Error(`value is missing for key ${key}`);
    } else {
      return item;
    }
  }

  private _insertBefore(key: Key, value: V, beforeKey: Key) {
    let prevKey = this._lastKey;

    if (!this._nullOrUndefined(beforeKey)) {
      prevKey = this._getOrThrow(beforeKey).prevKey;
    } else {
      beforeKey = null;
    }

    // Are we appending?
    if (beforeKey === null) {
      // Is there a last item?
      if (this._lastKey !== null) {
        // Link the last item forward to out new item
        this._getOrThrow(this._lastKey).nextKey = key;
      }

      // Update the lastKey
      this._lastKey = key;
    } else {
      // Link the next item backwards to our new item
      this._getOrThrow(beforeKey).prevKey = key;

      // Is there a previous item that needs to be linked forward to our new item?
      if (prevKey !== null) {
        this._getOrThrow(prevKey).nextKey = key;
      }
    }

    // Create item that links backwards to the previous item
    const item = { key, prevKey, nextKey: beforeKey, value };

    // Add the new item
    this._setItem(key, item);

    // Is this the 1st item?
    if (this._firstKey === null || beforeKey === this._firstKey) {
      this._firstKey = key;
    }

    // Increment our length counter
    this._length++;

    return item;
  }

  private _insertAfter(key: Key, value: V, afterKey: Key) {
    let nextKey = this._firstKey;

    if (!this._nullOrUndefined(afterKey)) {
      nextKey = this._getOrThrow(afterKey).nextKey;
    } else {
      afterKey = null;
    }

    // Are we prepending?
    if (afterKey === null) {
      // Is there a first item?
      if (this._firstKey !== null) {
        // Link the first item backward to out new item
        this._getOrThrow(this._firstKey).prevKey = key;
      }

      // Update the firstKey
      this._firstKey = key;
    } else {
      // Link the previous item forward to our new item
      this._getOrThrow(afterKey).nextKey = key;

      // Is there a next item that needs to be linked backwards to our new item?
      if (nextKey !== null) {
        this._getOrThrow(nextKey).prevKey = key;
      }
    }

    // Create item that links backwards to the previous item
    const item = { key, prevKey: afterKey, nextKey, value };

    // Add the new item
    this._setItem(key, item);

    // Is this the last item?
    if (this._lastKey === null || afterKey === this._lastKey) {
      this._lastKey = key;
    }

    // Increment our length counter
    this._length++;

    return item;
  }

  private _insert(key: Key, value: V, beforeKey: Key, afterKey: Key) {
    if (beforeKey !== undefined && afterKey !== undefined) {
      throw new Error('cannot specify both beforeKey and afterKey');
    }

    if (afterKey !== undefined) {
      return this._insertAfter(key, value, afterKey);
    } else {
      return this._insertBefore(key, value, beforeKey);
    }
  }

  private _delete(key: Key) {
    const item = this._getOrThrow(key);

    // Are we sandwiched between items?
    if (item.prevKey !== null && item.nextKey !== null) {
      // Point the surrounding items to each other
      const prevItem = this._getOrThrow(item.prevKey);
      const nextItem = this._getOrThrow(item.nextKey);
      prevItem.nextKey = item.nextKey;
      nextItem.prevKey = item.prevKey;
    } else {
      // Are we deleting the 1st item?
      if (item.prevKey === null) {
        // Is there a next item?
        if (item.nextKey !== null) {
          // The nextItem no longer has a previous item
          const nextItem = this._getOrThrow(item.nextKey);
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
          const prevItem = this._getOrThrow(item.prevKey);
          prevItem.nextKey = null;
        }

        // Pick the previous item as the last item
        this._lastKey = item.prevKey;
      }
    }

    // Decrement the length
    this._length--;

    // Delete the item
    this._deleteItem(key);

    return item;
  }

  private _update(key: Key, value: V, beforeKey: Key, afterKey: Key) {
    let item = this._getOrThrow(key);

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

  emitChange(name: string, item: Item<V>) {
    // We want to return the complete item so that we can communicate all changes, including when
    // items are moved. We clone the item so that the subscriber doesn't automatically update
    // private data.
    const clonedItem = { ...item };
    this.emit(name, clonedItem);
    this.emit('$change', name, clonedItem);
  }

  set(key: Key, value: V, beforeKey?: Key, afterKey?: Key) {
    let item = null;
    if (this._nullOrUndefined(key)) {
      this._throwKeyFalsyError();
    } else if (this.has(key)) {
      item = this._update(key, value, beforeKey, afterKey);
      this.emitChange('update', item);
    } else {
      item = this._insert(key, value, beforeKey, afterKey);
      this.emitChange('create', item);
    }
  }

  get(key: Key) {
    return this._getOrThrow(key).value;
  }

  *walkForward(key: Key, fullEntry?: boolean): ItemGenerator<V> {
    if (this.has(key)) {
      const item = this._getOrThrow(key);
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

  *walkBackward(key: Key, fullEntry?: boolean): ItemGenerator<V> {
    if (this.has(key)) {
      const item = this._getOrThrow(key);
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

  *values(startKey?: Key, reverse?: boolean): ValueGenerator<V> {
    if (reverse) {
      yield* this.walkBackward(
        startKey ? startKey : this._lastKey
      ) as ValueGenerator<V>;
    } else {
      yield* this.walkForward(
        startKey ? startKey : this._firstKey
      ) as ValueGenerator<V>;
    }
  }

  *entries(startKey?: Key, reverse?: boolean): FullEntryGenerator<V> {
    if (reverse) {
      yield* this.walkBackward(
        startKey ? startKey : this._lastKey,
        true
      ) as FullEntryGenerator<V>;
    } else {
      yield* this.walkForward(
        startKey ? startKey : this._firstKey,
        true
      ) as FullEntryGenerator<V>;
    }
  }

  forEach<U>(onValue: OnValue<V, U>) {
    for (const entry of this.entries()) {
      const last = entry[0] === this._lastKey;
      const again = onValue(entry[1], entry[0], last);

      // Do we need to exit prematurely?
      if (again === false) {
        break;
      }
    }
  }

  // Alias for forEach
  each<U>(onValue: OnValue<V, U>) {
    this.forEach(onValue);
  }

  map<U>(onValue: MapOnValue<V, U>): U[] {
    const values: U[] = [];
    this.forEach((value, key) => {
      values.push(onValue(value, key));
    });
    return values;
  }

  delete(key: Key) {
    const item = this._delete(key);
    this.emitChange('delete', item);
    return item;
  }

  length() {
    return this._length;
  }

  previousKey(key: Key) {
    return this._getOrThrow(key).prevKey;
  }

  previous(key: Key) {
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

  nextKey(key: Key) {
    return this._getOrThrow(key).nextKey;
  }

  next(key: Key) {
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
