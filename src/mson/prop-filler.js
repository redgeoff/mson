// TODO: use in validator as well?

import _ from 'lodash';

export default class PropFiller {
  constructor(props) {
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

  _getProp(name) {
    let names = name.split('.');
    if (names.length === 1) {
      return this._props[name];
    } else {
      try {
        let value = this._props[names[0]];
        for (let i = 1; i < names.length; i++) {
          value = value[names[i]];
        }
        return value;
      } catch (err) {
        // This can occur when there is no nested value in props
        return undefined;
      }
    }
  }

  // We leave the original template parameter strings intact if there isn't a match as the template
  // parameter may match at a secondary layer, e.g. the template parameter is not for the MSON
  // object, but in a validator.
  _getPropOrOriginalString(name, str) {
    const value = this._getProp(name);
    return value === undefined ? str : value;
  }

  fill(obj) {
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
    // Clone so that we don't mutate the passed object. We use clone instead of cloneDeep as this
    // fun is recursive and will do a deep clone by walking the tree.
    items = _.clone(items);

    _.each(items, (item, name) => {
      if (typeof item === 'object') {
        items[name] = this.fillAll(item);
      } else {
        items[name] = this.fill(item);
      }
    });

    return items;
  }
}
