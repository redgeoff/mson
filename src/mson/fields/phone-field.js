import TextField from './text-field';
import map from 'lodash/map';
import countryTelephoneData from 'country-telephone-data';

export default class PhoneField extends TextField {
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

  _maskValue(value) {
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

    return false;
  }

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'defaultMask',
            component: 'Field'
          }
        ]
      }
    });

    this._setDefaults(props, {
      mask: value => this._maskValue(value),
      defaultMask: this._stringToArrayMask('(...) ...-....')
    });
  }

  set(props) {
    const clonedProps = Object.assign({}, props);

    // Convert to RegExps?
    if (clonedProps.defaultMask !== undefined) {
      clonedProps.defaultMask = this._formatMask(clonedProps.defaultMask);
    }

    super.set(clonedProps);
  }
}
