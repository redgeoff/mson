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

  // // A recursive merge that also concats arrays
  // merge(object, sources) {
  //   const mergeCustomizer = (objValue, srcValue) => {
  //     if (_.isArray(objValue)) {
  //       return objValue.concat(srcValue);
  //     }
  //   };
  //   return _.mergeWith(object, sources, mergeCustomizer);
  // }

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
}

export default new Utils();
