import _ from 'lodash';
import globals from './globals';

class Utils {
  async sequential(items, onItem) {
    const values = [];
    await _.reduce(
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

  _mergeCustomizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  };

  // A recursive merge that also concats arrays
  merge(object, sources) {
    return _.mergeWith(object, sources, this._mergeCustomizer);
  }

  inBrowser() {
    return !!global.window;
  }

  // Source: https://stackoverflow.com/a/40577337/2831606
  getAllMethodNames(obj) {
    let methods = new Set();
    while ((obj = Reflect.getPrototypeOf(obj))) {
      let keys = Reflect.ownKeys(obj);
      keys.forEach(k => methods.add(k));
    }
    return methods;
  }

  setFormErrorsFromAPIError(err, form) {
    try {
      const message = JSON.parse(err.graphQLErrors[0].message);
      message.error.forEach(err => {
        form.getField(err.field).setErr(err.error);
      });
    } catch (_err) {
      // An error can occur if the message is not a JSON object, e.g. if we don't have access to
      // archive, etc... The caller will still throw the main error. TODO: Is there a better way to
      // handle this? Should all messages be JSON objects? That would probably be too limiting,
      // right?
      globals.displayAlert({ title: 'Unexpected Error', text: err.toString() });
    }
  }

  combineWheres(where1, where2) {
    // Clone so that we don't modify the original where
    where1 = _.cloneDeep(where1);
    where2 = _.cloneDeep(where2);

    if (where1 && where2) {
      return {
        $and: [where1, where2]
      };
    } else if (where1) {
      return where1;
    } else {
      return where2;
    }
  }

  toWhereFromSearchString(attributes, string) {
    const trimmed = string.trim();

    // Empty?
    if (trimmed === '') {
      return null;
    }

    const words = trimmed.split(/ +/);

    const ors = [];

    attributes.forEach(attr => {
      const ands = [];
      words.forEach(word => {
        ands.push({
          [attr]: {
            // We need to use iLike as like is not case sensitive with binary (like JSON) data
            $iLike: word + '%'
          }
        });
      });
      ors.push({
        $and: ands
      });
    });

    return {
      $or: ors
    };
  }
}

export default new Utils();
