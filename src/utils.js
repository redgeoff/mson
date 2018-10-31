import reduce from 'lodash/reduce';
import each from 'lodash/each';
import uuid from 'uuid';

export class Utils {
  constructor() {
    // For mocking
    this._global = global;
  }

  async sequential(items, onItem) {
    const values = [];
    await reduce(
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
    while ((obj = Reflect.getPrototypeOf(obj))) {
      const keys = Reflect.ownKeys(obj);
      keys.forEach(k => methods.push(k));
    }
    return methods;
  }

  getAllFunctionNames(obj) {
    const methods = [];
    each(obj, (property, name) => {
      if (typeof property === 'function') {
        methods.push(name);
      }
    });

    return methods;
  }

  combineWheres(...wheres) {
    const and = [];

    wheres.forEach(where => {
      if (where) {
        and.push(where);
      }
    });

    if (and.length === 1) {
      return and[0];
    } else {
      return {
        $and: and
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

    words.forEach(word => {
      const ors = [];
      attributes.forEach(attr => {
        ors.push({
          [attr]: {
            // We need to use iLike as like is not case sensitive with binary (like JSON) data
            $iLike: word + '%'
          }
        });
      });
      ands.push({
        $or: ors
      });
    });

    return {
      $and: ands
    };
  }

  uuid() {
    return uuid.v4();
  }

  once(emitter, evnt) {
    return new Promise(function(resolve) {
      emitter.once(evnt, function() {
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
}

export default new Utils();
