import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

type ReduceIterator<T, TResult, TList> = (
  prev: TResult,
  curr: T,
  index: number | string,
  list?: TList
) => TResult;

type SequentialIterator<T, TResult> = (
  curr: T,
  index: number | string
) => TResult;

// Source: mingo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
type AnyVal = unknown;
type RawObject = Record<string, AnyVal>;

export type OnItem<T, U> = (
  value?: T,
  key?: string | number,
  last?: boolean
) => boolean | U | void;

export class Utils {
  private _global;

  constructor() {
    // For mocking
    this._global = global;
  }

  _reduce<T, TResult>(
    collection: T[],
    callback: ReduceIterator<T, TResult, T[]>,
    accumulator: TResult
  ) {
    if (Array.isArray(collection)) {
      return collection.reduce(callback, accumulator);
    } else {
      return Object.entries<T>(collection).reduce(
        (previousValue, [key, item]) => callback(previousValue, item, key),
        accumulator
      );
    }
  }

  async sequential<T, TResult>(
    items: T[],
    onItem: SequentialIterator<T, TResult>
  ) {
    const values: Awaited<TResult>[] = [];
    await this._reduce(
      items,
      async (promise, item, key) => {
        await promise;
        const value = await onItem(item, key);
        if (value !== undefined) {
          values.push(value);
        }
      },
      Promise.resolve()
    );
    return values;
  }

  _isObject(item: object) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Source: https://stackoverflow.com/a/48218209/2831606
  merge(...objects: object[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return objects.reduce((prev: any, obj: any) => {
      if (obj !== undefined) {
        Object.keys(obj).forEach((key) => {
          const pVal = prev[key];
          const oVal = obj[key];

          if (Array.isArray(pVal) && Array.isArray(oVal)) {
            prev[key] = pVal.concat(...oVal);
          } else if (this._isObject(pVal) && this._isObject(oVal)) {
            prev[key] = this.merge(pVal, oVal);
          } else {
            prev[key] = oVal;
          }
        });
      }

      return prev;
    }, {});
  }

  inBrowser() {
    return !!this._global.window;
  }

  // Source: https://stackoverflow.com/a/40577337/2831606
  getAllMethodNames(obj: object) {
    const names: (string | symbol)[] = [];

    let o: object | null = obj;

    // Note: this silly function is needed to prevent eslint from complaining about "Function
    // declared in a loop contains unsafe references to variable(s)"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fun = (o: any) => {
      return (k: string | symbol) => {
        // Prevent considering things like symbols
        if (typeof o[k] === 'function') {
          names.push(k);
        }
      };
    };

    while ((o = Reflect.getPrototypeOf(o))) {
      const keys = Reflect.ownKeys(o);
      keys.forEach(fun(o));
    }
    return names;
  }

  getAllFunctionNames(obj: object) {
    const names: (string | symbol)[] = [];

    Object.entries(obj).forEach(([name, property]) => {
      if (typeof property === 'function') {
        names.push(name);
      }
    });

    return names;
  }

  combineWheres(...wheres: RawObject[]) {
    const and: RawObject[] = [];

    wheres.forEach((where) => {
      if (where) {
        and.push(where);
      }
    });

    if (and.length === 1) {
      return and[0];
    } else {
      return {
        $and: and,
      };
    }
  }

  toWhereFromSearchString(attributes: string[], string: string) {
    const trimmed = string.trim();

    // Empty?
    if (trimmed === '') {
      return null;
    }

    const words = trimmed.split(/ +/);

    const ands: RawObject[] = [];

    words.forEach((word) => {
      const ors: RawObject[] = [];
      attributes.forEach((attr) => {
        ors.push({
          [attr]: {
            // We need to use iLike as like is not case sensitive with binary (like JSON) data
            $iLike: word + '%',
          },
        });
      });
      ands.push({
        $or: ors,
      });
    });

    return {
      $and: ands,
    };
  }

  uuid() {
    return uuidv4();
  }

  once(emitter: EventEmitter, evnt: string | symbol) {
    return new Promise(function (resolve) {
      emitter.once(evnt, function (...args) {
        resolve(args);
      });
    });
  }

  isRegExpString(string: string) {
    return new RegExp('^/(.*)/(.*)$').test(string);
  }

  stringToRegExp(string: string) {
    // JSON doesn't support RegExp types so convert string representations to RegExp, including
    // flags
    const match = string.match(new RegExp('^/(.*)/(.*)$'));
    if (match === null) {
      throw new Error('string must in the form "/.*/.*"');
    }
    return new RegExp(match[1], match[2]);
  }

  toRegExp(item: RegExp | string) {
    return item instanceof RegExp ? item : this.stringToRegExp(item);
  }

  toSingular(plural: string) {
    // Automatically calculate singular label by removing last 's'
    return plural.substring(0, plural.length - 1);
  }

  // synchronize(synchronizer, promiseFactory) {
  //   const promise = synchronizer.then(() => {
  //     return promiseFactory();
  //   });
  //   synchronizer = synchronizer.then(() => promise);
  //   return promise;
  // }

  // Source: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_difference
  difference<T>(a: T[], b: T[]) {
    if (b === undefined) {
      return a;
    } else {
      return [a, b].reduce((a, b) => a.filter((c) => !b.includes(c)));
    }
  }

  // Note: only use this if you need to exit the loop prematurely by having onItem() return false;
  // or if obj may be falsy. Otherwise, just use Object.entries(), Object.keys(), or
  // Object.values().
  each<T, U>(obj: object, onItem: OnItem<T, U>) {
    if (obj !== undefined && obj !== null) {
      const entries = Object.entries(obj);
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const again = onItem(value, key);
        if (again === false) {
          break;
        }
      }
    }
  }

  // Source: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
  get<T>(obj: T, path: string, defaultValue = undefined) {
    const travel = (regExp: RegExp) =>
      String.prototype.split
        .call(path, regExp)
        .filter(Boolean)
        .reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (res: any, key) =>
            res !== null && res !== undefined ? res[key] : res,
          obj
        );
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
  }

  clone(obj: object) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Source: https://stackoverflow.com/a/30446887/2831606
  _orderBySorter<T>(iteratees: string[], orders: string[]) {
    return (a: T, b: T) =>
      iteratees
        .map((i, j) => {
          const o = orders?.[j];
          const dir = o === 'desc' ? -1 : 1;
          const aI = this.get(a, i);
          const bI = this.get(b, i);
          return aI > bI ? dir : aI < bI ? -dir : 0;
        })
        .reduce((p, n) => (p ? p : n), 0);
  }

  orderBy<T>(items: T[], iteratees: string[], orders: string[]) {
    // Use concat to copy the array so that we don't mutate the original
    return items.concat().sort(this._orderBySorter(iteratees, orders));
  }

  set<T>(obj: object, path: string, value: T) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    const keys = path ? path.split('.') : [path];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let curObj: any = obj;

    // Loop for all keys, except the last one
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      // The key is not present in the object so create a placeholder object
      if (curObj[key] === undefined) {
        curObj[key] = {};
      }

      // Point to latest key
      curObj = curObj[key];
    }

    // Set the value for the last key
    curObj[keys[keys.length - 1]] = value;

    return obj;
  }

  isEqual(value: object, other: object) {
    return JSON.stringify(value) === JSON.stringify(other);
  }

  // Source: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_isempty
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEmpty(obj: any) {
    return (
      [Object, Array].includes((obj || {}).constructor) &&
      !Object.entries(obj || {}).length
    );
  }
}

export default new Utils();
