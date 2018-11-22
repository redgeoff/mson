// TODO: move from compiler directory as used by multiple modules

import cloneDeepWith from 'lodash/cloneDeepWith';

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
    let matches = str.match(/^{{([^{]*)}}$/);
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
        return obj.replace(/{{([^{]*)}}/g, (match, name) => {
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
    return cloneDeepWith(items, item => {
      if (item && item._className) {
        // The item is a component, therefore we should not clone it. TODO: is there a better way to
        // determine this?
        return item;
      } else if (typeof item === 'string') {
        return this.fillString(item);
      }
    });
  }

  fill(obj) {
    if (typeof obj === 'string') {
      return this.fillString(obj);
    } else {
      return this.fillAll(obj);
    }
  }
}
