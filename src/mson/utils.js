import _ from 'lodash';

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
}

export default new Utils();
