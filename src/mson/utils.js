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
}

export default new Utils();
