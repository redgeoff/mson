import { v4 as uuidv4 } from 'uuid';
export class Utils {
  constructor() {
    // For mocking
    this._global = global;
  }

  _reduce(collection, callback, accumulator) {
    if (Array.isArray(collection)) {
      return collection.reduce(callback, accumulator);
    } else {
      return Object.entries(collection).reduce((previousValue, [key, item]) => {
        return callback(previousValue, item, key);
      }, accumulator);
    }
  }

  async sequential(items, onItem) {
    const values = [];
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

  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Credit: https://stackoverflow.com/a/48218209/2831606
  merge(...objects) {
    return objects.reduce((prev, obj) => {
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
  getAllMethodNames(obj) {
    const methods = [];

    // Note: this silly function is needed to prevent eslint from complaining about "Function
    // declared in a loop contains unsafe references to variable(s)"
    const fun = (obj) => {
      return (k) => {
        // Prevent considering things like symbols
        if (typeof obj[k] === 'function') {
          methods.push(k);
        }
      };
    };

    while ((obj = Reflect.getPrototypeOf(obj))) {
      const keys = Reflect.ownKeys(obj);
      keys.forEach(fun(obj));
    }
    return methods;
  }

  getAllFunctionNames(obj) {
    const methods = [];
    Object.entries(obj).forEach(([name, property]) => {
      if (typeof property === 'function') {
        methods.push(name);
      }
    });

    return methods;
  }

  combineWheres(...wheres) {
    const and = [];

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

  toWhereFromSearchString(attributes, string) {
    const trimmed = string.trim();

    // Empty?
    if (trimmed === '') {
      return null;
    }

    const words = trimmed.split(/ +/);

    const ands = [];

    words.forEach((word) => {
      const ors = [];
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

  once(emitter, evnt) {
    return new Promise(function (resolve) {
      emitter.once(evnt, function () {
        resolve(arguments);
      });
    });
  }

  isRegExpString(string) {
    return new RegExp('^/(.*)/(.*)$').test(string);
  }

  stringToRegExp(string) {
    // JSON doesn't support RegExp types so convert string representations to RegExp, including
    // flags
    const match = string.match(new RegExp('^/(.*)/(.*)$'));
    return new RegExp(match[1], match[2]);
  }

  toRegExp(item) {
    return item instanceof RegExp ? item : this.stringToRegExp(item);
  }

  toSingular(plural) {
    // Automatically calculate singular label by removing last 's'
    return plural.substr(0, plural.length - 1);
  }

  // synchronize(synchronizer, promiseFactory) {
  //   const promise = synchronizer.then(() => {
  //     return promiseFactory();
  //   });
  //   synchronizer = synchronizer.then(() => promise);
  //   return promise;
  // }

  // Credit: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_difference
  difference(a, b) {
    if (b === undefined) {
      return a;
    } else {
      return [a, b].reduce((a, b) => a.filter((c) => !b.includes(c)));
    }
  }

  // Note: only use this if you need to exit the loop prematurely by having onItem() return false;
  // or if obj may be falsy. Otherwise, just use Object.entries(), Object.keys(), or
  // Object.values().
  each(obj, onItem) {
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
  get(obj, path, defaultValue = undefined) {
    const travel = (regexp) =>
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce(
          (res, key) => (res !== null && res !== undefined ? res[key] : res),
          obj
        );
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
  }

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Credit: https://stackoverflow.com/a/30446887/2831606
  _orderBySorter(iteratees, orders) {
    return (a, b) =>
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

  orderBy(items, iteratees, orders) {
    // Use concat to copy the array so that we don't mutate the original
    return items.concat().sort(this._orderBySorter(iteratees, orders));
  }

  set(obj, path, value) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    const keys = path ? path.split('.') : [path];
    let curObj = obj;

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
}

export default new Utils();
