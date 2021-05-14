// TODO: move from compiler directory as used by multiple modules

import { deepCloneWith } from '../utils/deep-clone';
import { executeQuery, isOperator } from './query';
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
    let hasProperty = false;
    let value = undefined;

    try {
      let names = name.split('.');
      let nestedObj;

      // Getter?
      if (obj.get && typeof obj.get === 'function') {
        nestedObj = obj.get(names[0]);
        hasProperty = true;
      } else {
        nestedObj = obj[names[0]];
        hasProperty = obj.hasOwnProperty(names[0]);
      }

      if (names.length > 1) {
        names.shift(); // remove 1st name
        value = this._getPropFromObj(nestedObj, names.join('.')).value;
      } else {
        value = nestedObj;
      }
    } catch (err) {
      // This can occur when there is no nested value in props. We swallow this and return the
      // defaults for hasProperty and value.
    }

    return {
      value,
      hasProperty,
    };
  }

  _getProp(name) {
    return this._getPropFromObj(this._props, name);
  }

  _getPropOrOriginalString(name, str, customizer) {
    const { value, hasProperty } = this._getProp(name);
    // We need to analyze hasProperty as the property may exist but the value is undefined, e.g.
    // `{foo: undefined }`
    if (hasProperty) {
      return customizer ? customizer(value) : value;
    } else {
      // We leave the original template parameter strings intact if there isn't a match as the template
      // parameter may match at a secondary layer, e.g. the template parameter is not for the MSON
      // object, but in a validator.
      return str;
    }
  }

  fillString(obj, customizer) {
    // Is obj a string?
    if (typeof obj === 'string') {
      // Is the string just a template string?
      let name = this._getTemplateName(obj);
      if (name !== undefined) {
        // Replace with the raw prop so that numbers are not converted to strings by replace()
        return this._getPropOrOriginalString(name, obj, customizer);
      } else {
        return obj.replace(/{{([^{}]*)}}/g, (match, name) => {
          return this._getPropOrOriginalString(name, match, customizer);
        });
      }
    } else {
      // We only fill strings so just return the original object
      return customizer ? customizer(obj) : obj;
    }
  }

  _fillAllInner(items, preventQuery, customizer) {
    let isQuery = false;

    // Recursively dive into objects and fill any strings
    const obj = deepCloneWith(items, (item, name) => {
      if (!preventQuery && !isQuery && isOperator(name)) {
        // We need to check all attribute names as the operator may be nested
        // e.g. `{ x: $add: [1, 2], y: 3 }`
        isQuery = true;
      }

      let performDefaultClone = false;
      let clonedObject = undefined;

      if (item && item._className) {
        // The item is a component, therefore we should not clone it. TODO: is there a better way to
        // determine this?
        clonedObject = item;
      } else if (typeof item === 'string') {
        clonedObject = this.fillString(item, customizer);
      } else if (typeof item === 'function') {
        // e.g. JavaScript action
        clonedObject = item;
      } else {
        performDefaultClone = true;
      }

      return {
        performDefaultClone,
        clonedObject,
      };
    });

    return {
      obj,
      isQuery,
    };
  }

  fillAll(items) {
    return this._fillAllInner(items).obj;
  }

  fill(obj, preventQuery, customizer) {
    if (typeof obj === 'string') {
      return this.fillString(obj, customizer);
    } else {
      const filled = this._fillAllInner(obj, preventQuery, customizer);

      if (preventQuery || !filled.isQuery) {
        return filled.obj;
      } else {
        // We choose to execute the Mongo query in this layer instead of BaseComponent._setProperty()
        // as BaseComponent._setProperty() is called far more frequently and we want to avoid the
        // unneeded overhead.
        return executeQuery(filled.obj);
      }
    }
  }
}
