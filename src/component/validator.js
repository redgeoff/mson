import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import sift from 'sift';

export default class Validator {
  constructor(props) {
    this._props = props;
  }

  _getTemplateName(str) {
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
      let value = this._props[names[0]];
      for (let i = 1; i < names.length; i++) {
        // Value can be falsy if the field was removed and a validator still references the field.
        // TODO: is this durability the best way of handling broken validators when fields are
        // removed?
        if (value) {
          value = value[names[i]];
        }
      }
      return value;
    }
  }

  _fillProps(str) {
    // Is the string just a template string?
    let name = this._getTemplateName(str);
    if (name !== undefined) {
      // Replace with the raw prop so that numbers are not converted to strings by replace()
      return this._getProp(name);
    } else {
      return str.replace(/{{([^{]*)}}/g, (match, name) => {
        return this._getProp(name);
      });
    }
  }

  // Performs in place fill to prepare for sift query
  _fillWhere(where) {
    each(where, (node, name) => {
      // Leaf node?
      if (typeof node === 'string') {
        where[name] = this._fillProps(node);
      } else {
        // Recursively process node
        this._fillWhere(node);
      }
    });
  }

  _fillErrorProps(error) {
    if (typeof error === 'string') {
      return this._fillProps(error);
    } else {
      error.error = this._fillProps(error.error);
      return error;
    }
  }

  _validateWithRule(rule) {
    // Clone where as we will be modifying the leaf nodes
    let where = cloneDeep(rule.where);

    // Fill the props
    this._fillWhere(where);

    // Validation failed?
    let sifted = sift(where, [this._props]);
    if (sifted.length > 0) {
      return this._fillErrorProps(rule.error);
    }
  }

  validate(rules, all) {
    let errors = [];

    for (let i = 0; i < rules.length; i++) {
      let error = this._validateWithRule(rules[i]);
      if (error !== undefined) {
        errors.push(error);

        // Do we only want the first error?
        if (!all) {
          break;
        }
      }
    }

    return errors;
  }
}
