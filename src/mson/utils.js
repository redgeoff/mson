import _ from 'lodash';

class Utils {
  async sequential(items, onItem) {
    await items.reduce(async (promise, item) => {
      await promise
      await onItem(item);
    }, Promise.resolve())
  }

  _mergeCustomizer = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }

  // A recursive merge that also concats arrays
  merge(object, sources) {
    return _.mergeWith(object, sources, this._mergeCustomizer);
  }
}

export default new Utils();
