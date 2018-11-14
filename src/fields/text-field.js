import Field from './field';
import utils from '../utils';
import { conformToMask } from 'vanilla-text-mask';
import map from 'lodash/map';

export default class TextField extends Field {
  _className = 'TextField';

  _setTextFieldSchema() {
    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'minLength',
            component: 'IntegerField',
            label: 'Min Length',
            docLevel: 'basic'
          },
          {
            name: 'maxLength',
            component: 'IntegerField',
            label: 'Max Length',
            docLevel: 'basic'
          },
          {
            name: 'minWords',
            component: 'IntegerField',
            label: 'Min Words'
            // docLevel: 'basic' // Document once implemented
          },
          {
            name: 'maxWords',
            component: 'IntegerField',
            label: 'Max Words'
            // docLevel: 'basic' // Document once implemented
          },
          {
            // TODO: define list of acceptable values
            name: 'type',
            component: 'TextField'
          },
          {
            name: 'invalidRegExp',
            component: 'TextField',
            label: 'Invalid RegExp',
            docLevel: 'basic',
            help: 'Invalid if this regular expression matches, e.g. /foo/'
          },
          {
            name: 'multiline',
            component: 'BooleanField',
            label: 'Multiline',
            docLevel: 'basic'
          },
          {
            name: 'rows',
            component: 'IntegerField'
          },
          {
            name: 'rowsMax',
            component: 'IntegerField'
          },
          {
            name: 'mask',
            component: 'Field'
          },
          {
            name: 'unmask',
            component: 'RegExpField'
          }
        ],
        hidden: this._hideTextFieldSchema
      }
    });
  }

  _create(props) {
    super._create(props);

    this._requireString = true;

    this._setTextFieldSchema();
  }

  _toValidatorProps() {
    return {
      get: name => {
        switch (name) {
          case 'length':
            return this.get('value').length;
          case 'words':
            return this.get('value').split(/\s+/).length;
          default:
            return this.get(name);
        }
      }
    };
  }

  validate() {
    super.validate();

    if (!this.isBlank()) {
      const value = this.getValue();
      if (typeof value === 'string') {
        const minLength = this.get('minLength');
        const maxLength = this.get('maxLength');
        const invalidRegExp = this.get('invalidRegExp');

        if (minLength !== null && value.length < minLength) {
          this.setErr(`${minLength} characters or more`);
        } else if (maxLength !== null && value.length > maxLength) {
          this.setErr(`${maxLength} characters or less`);
        } else if (
          invalidRegExp &&
          utils.isRegExpString(invalidRegExp) &&
          utils.toRegExp(invalidRegExp).test(value)
        ) {
          this.setErr(`invalid`);
        }
      } else if (this._requireString) {
        this.setErr(`must be a string`);
      }
    }

    // TODO: minWords, maxWords
  }

  _stringToArrayMask(mask) {
    return map(mask, item => (item === '.' ? /./ : item));
  }

  _formatMask(mask) {
    if (Array.isArray(mask)) {
      return mask.map(item => {
        // Is the item a RegExp or a string that is not formatted as a RegExp?
        if (item instanceof RegExp || !utils.isRegExpString(item)) {
          return item;
        } else {
          // The string is formatted as a RegExp, e.g. '/foo/i'
          return utils.toRegExp(item);
        }
      });
    } else if (typeof mask === 'string') {
      return this._stringToArrayMask(mask);
    } else {
      // Function
      return mask;
    }
  }

  _formatUnmask(unmask) {
    return utils.toRegExp(unmask);
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert to RegExps?
    if (clonedProps.mask !== undefined) {
      clonedProps.mask = this._formatMask(clonedProps.mask);
    }

    // Convert to RegExp?
    if (clonedProps.unmask !== undefined) {
      clonedProps.unmask = this._formatUnmask(clonedProps.unmask);
    }

    super.set(clonedProps);
  }

  _conformToMask(value, mask) {
    var conformed = conformToMask(value, mask, {
      guide: false
    });
    return conformed.conformedValue;
  }

  toConformedValue(value) {
    return this._conformToMask(value, this.get('mask'));
  }

  getDisplayValue() {
    if (this.isBlank() || !this.get('mask')) {
      return super.getDisplayValue();
    } else {
      return this.toConformedValue(this.getUIValue());
    }
  }

  toUnmaskedValue(value) {
    // The unmask is used to remove any formatting that should not be in our store
    const unmask = this.get('unmask');
    if (this.isValueBlank(value) || !unmask) {
      return value;
    } else {
      return value.replace(unmask, '');
    }
  }

  fromUIValue(value) {
    return this.toUnmaskedValue(value);
  }

  getUIValue() {
    // Convert to string so that we can perform string functions on the value
    return this.isBlank() ? '' : String(this.get('value'));
  }

  isValueBlank(value) {
    // Value can be '' when user clears value in UI
    return super.isValueBlank(value) || value === '';
  }
}
