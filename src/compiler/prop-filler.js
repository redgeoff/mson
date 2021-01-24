// TODO: move from compiler directory as used by multiple modules

import cloneDeepWith from 'lodash/cloneDeepWith';
import each from 'lodash/each';

import { Aggregator } from 'mingo/aggregator';
import 'mingo/init/system';

export default class PropFiller {
  constructor(props) {
    this.setProps(props);
  }

  setProps(props) {
    this._props = props;
  }

  _getTemplateName(str) {
    // Note: we use a format like {{name}} instead of ${name} as some linters report errors when
    // template strings are found in regular strings.
    let matches = str.match(/^{{([^{}]*)}}$/);
    if (matches) {
      return matches[1];
    }
  }

  _getPropFromObj(obj, name) {
    try {
      let names = name.split('.');
      let nestedObj;

      // Getter?
      if (obj.get && typeof obj.get === 'function') {
        nestedObj = obj.get(names[0]);
      } else {
        nestedObj = obj[names[0]];
      }

      if (names.length > 1) {
        names.shift(); // remove 1st name
        return this._getPropFromObj(nestedObj, names.join('.'));
      } else {
        return nestedObj;
      }
    } catch (err) {
      // This can occur when there is no nested value in props
      return undefined;
    }
  }

  _getProp(name) {
    return this._getPropFromObj(this._props, name);
  }

  // We leave the original template parameter strings intact if there isn't a match as the template
  // parameter may match at a secondary layer, e.g. the template parameter is not for the MSON
  // object, but in a validator.
  _getPropOrOriginalString(name, str) {
    const value = this._getProp(name);
    return value === undefined ? str : value;
  }

  fillString(obj) {
    // Is obj a string?
    if (typeof obj === 'string') {
      // Is the string just a template string?
      let name = this._getTemplateName(obj);
      if (name !== undefined) {
        // Replace with the raw prop so that numbers are not converted to strings by replace()
        return this._getPropOrOriginalString(name, obj);
      } else {
        return obj.replace(/{{([^{}]*)}}/g, (match, name) => {
          return this._getPropOrOriginalString(name, match);
        });
      }
    } else {
      // We only fill strings so just return the original object
      return obj;
    }
  }

  fillAll(items) {
    // Recursively dive into objects and fill any strings
    return cloneDeepWith(items, (item) => {
      if (item && item._className) {
        // The item is a component, therefore we should not clone it. TODO: is there a better way to
        // determine this?
        return item;
      } else if (typeof item === 'string') {
        return this.fillString(item);
      }
    });
  }

  // TODO: move
  _getFirstKey(obj) {
    // TODO: this should be faster than `Object.keys(obj)[0]`, but we should test this assumption.
    let firstKey = undefined;
    each(obj, (value, key) => {
      firstKey = key;
      return false; // Exit loop
    });
    return firstKey;
  }

  // TODO: move
  _isOperator(key) {
    // If the key starts with $ then assume it is an operator. This is the same method that mingo
    // uses:
    // https://github.com/kofrasa/mingo/blob/924e8f5d1411a5879983de6c986dfdaf12bcb459/src/util.ts#L890
    return typeof key === 'string' && key[0] === '$';
  }

  _isAggegation(obj) {
    // Is the first key in the object an operator? e.g.
    // {
    //   $cond: [
    //     {
    //       $eq: ['{{value}}', 'Jack']
    //     },
    //     'is Jack',
    //     'is Jill'
    //   ]
    // }
    //
    // We use this to determine if obj is an aggregation. An alternative to this would be
    // to accept values like `{ mongo: <query> }`, but that adds a lot of bloat.
    const firstKey = this._getFirstKey(obj);
    return firstKey !== undefined && this._isOperator(firstKey);
  }

  // TODO: move pieces to "query" layer
  _resolveAnyAggregation(obj) {
    if (this._isAggegation(obj)) {
      const agg = new Aggregator([
        {
          $project: {
            value: obj,
          },
        },
      ]);

      // We use an empty collection as substitution of parameters is handled by MSON's template
      // parameters, which are swapped out before the mingo query is run
      const collection = [{}];

      const result = agg.run(collection);

      return result && result[0] && result[0].value;
    } else {
      return obj;
    }
  }

  fill(obj, preventAggregation) {
    if (typeof obj === 'string') {
      return this.fillString(obj);
    } else {
      const filledObj = this.fillAll(obj);

      if (preventAggregation) {
        return filledObj;
      } else {
        // We choose to execute the Mongo query in this layer instead of BaseComponent._setProperty()
        // as BaseComponent._setProperty() is called far more frequently and we want to avoid the
        // unneeded overhead.
        return this._resolveAnyAggregation(filledObj);
      }
    }
  }
}
