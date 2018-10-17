import TextFieldHiddenSchema from './text-field-hidden-schema';
import map from 'lodash/map';
import countryTelephoneData from 'country-telephone-data';

const EMPTY_MASK = [/./, /./, /./, /./];

export default class PhoneField extends TextFieldHiddenSchema {
  _className = 'PhoneField';

  _stringToArrayMask(mask) {
    return map(mask, item => (item === '.' ? /\d/ : item));
  }

  static getCountriesByCode() {
    if (!this.constructor._countriesByCode) {
      this.constructor._countriesByCode = {};
      const countriesByCode = this.constructor._countriesByCode;
      countryTelephoneData.allCountries.forEach(
        country => (countriesByCode[country.dialCode] = country)
      );
    }
    return this.constructor._countriesByCode;
  }

  _getMask(value) {
    if (value) {
      const countries = this.constructor.getCountriesByCode();
      if (value[0] === '+') {
        // Single-digit match
        let country = countries[value[1]];

        // Double-digit match
        if (!country) {
          country = countries[[value[1], value[2]].join('')];
        }

        // Triple-digit match
        if (!country) {
          country = countries[[value[1], value[2], value[3]].join('')];
        }

        if (country) {
          return this._stringToArrayMask(country.format);
        }
      } else {
        return this.get('defaultMask');
      }
    }

    // When returning false, there appears to be a bug in MaskedInput (react layer) that causes
    // issues when clearing the input, i.e. the old value is still present. As a workaround, we'll
    // return a mask that allows the user to enter any four characters--enough to determine the
    // final mask.
    //
    // Disable mask so that user can user can enter the first few characters, which will determine
    // the applicable mask
    // return false;
    //
    return EMPTY_MASK;
  }

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'defaultMask',
            component: 'TextField',
            label: 'Default Mask',
            docLevel: 'basic'
          }
        ]
      }
    });

    this._setDefaults(props, {
      mask: value => this._getMask(value),
      defaultMask: this._stringToArrayMask('(...) ...-....')
    });
  }

  toConformedValue(value) {
    const mask = this._getMask(value);
    // Is there a mask in which to conform?
    if (mask !== EMPTY_MASK) {
      return super.toConformedValue(value);
    } else {
      return value;
    }
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert to RegExps?
    if (clonedProps.defaultMask !== undefined) {
      clonedProps.defaultMask = this._formatMask(clonedProps.defaultMask);
    }

    if (clonedProps.value !== undefined) {
      clonedProps.value = this.toConformedValue(clonedProps.value);
    }

    super.set(clonedProps);
  }

  _conformsToMask(value, mask) {
    let conforms = true;
    mask.forEach((item, index) => {
      if (item instanceof RegExp) {
        if (!item.test(value[index])) {
          conforms = false;
        }
      } else if (value[index] !== item) {
        conforms = false;
      }
    });
    return conforms;
  }

  validate() {
    super.validate();

    if (!this.hasErr() && !this.isBlank()) {
      const value = this.getValue();
      let mask = this._getMask(value);
      if (mask === EMPTY_MASK || !this._conformsToMask(value, mask)) {
        this.setErr('invalid');
      }
    }
  }
}
