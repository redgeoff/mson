import TextFieldHiddenSchema from './text-field-hidden-schema';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

const MASK_PROPS = [
  'prefix',
  'suffix',
  'includeThousandsSeparator',
  'thousandsSeparatorSymbol',
  'allowDecimal',
  'decimalSymbol',
  'decimalLimit',
  'allowNegative'
];

export default class NumberField extends TextFieldHiddenSchema {
  _className = 'NumberField';

  _create(props) {
    super._create(props);

    this._requireString = false;

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'minValue',
            component: 'NumberField',
            label: 'Min Value',
            docLevel: 'basic',
            thousandsSeparatorSymbol: ','
          },
          {
            name: 'maxValue',
            component: 'NumberField',
            label: 'Max Value',
            docLevel: 'basic',
            thousandsSeparatorSymbol: ','
          },
          {
            name: 'prefix',
            component: 'TextField',
            label: 'Prefix',
            docLevel: 'basic'
          },
          {
            name: 'suffix',
            component: 'TextField'
          },
          {
            name: 'includeThousandsSeparator',
            component: 'BooleanField'
          },
          {
            name: 'thousandsSeparatorSymbol',
            component: 'TextField'
          },
          {
            name: 'allowDecimal',
            component: 'BooleanField'
          },
          {
            name: 'decimalSymbol',
            component: 'TextField'
          },
          {
            name: 'decimalLimit',
            component: 'IntegerField'
          },
          {
            name: 'allowNegative',
            component: 'BooleanField'
          }
        ]
      }
    });

    this._setDefaults(props, {
      unmask: /[^\d\\.]/g
    });
  }

  _validateLengths() {
    if (!this.isBlank()) {
      const value = this.getValue();
      const minValue = this.get('minValue');
      const maxValue = this.get('maxValue');

      if (minValue !== null && value < minValue) {
        this.setErr(`must be ${minValue} or greater`);
      } else if (maxValue !== null && value > maxValue) {
        this.setErr(`must be ${maxValue} or less`);
      }
    }
  }

  validate() {
    super.validate();

    this._validateWithRegExp(/^([+-]?\d*\.?\d*)$/, 'not a number');

    if (!this.hasErr()) {
      this._validateLengths();
    }
  }

  _shouldCreateMask(props) {
    // Is a masked prop defined and it is changing?
    let shouldCreate = false;
    MASK_PROPS.forEach(name => {
      if (
        props[name] !== undefined &&
        props[name] !== this._getProperty(name)
      ) {
        shouldCreate = true;
      }
    });
    return shouldCreate;
  }

  _createMask(props) {
    const maskOpts = {
      prefix: '', // override default of '$'
      allowDecimal: true,
      decimalLimit: null,
      allowNegative: true
    };

    MASK_PROPS.forEach(name => {
      if (props[name] !== undefined) {
        maskOpts[name] = props[name];
      }
    });

    this.set({ mask: createNumberMask(maskOpts) });
  }

  set(props) {
    // This needs to be executed before super.set() as we need to compare new and previous values of
    // the props
    if (this._shouldCreateMask(props)) {
      this._createMask(props);
    }

    super.set(props);
  }

  fromUIValue(value) {
    const decimalSymbol = this.get('decimalSymbol');
    if (decimalSymbol && decimalSymbol !== '.' && !this.isValueBlank(value)) {
      const tmpSymbol = 'A';

      // Replace decimal symbol with tmp symbol
      value = value.replace(decimalSymbol, tmpSymbol);

      // Remove everything except number, sign and tmp symbol
      value = value.replace(/[^\d-A]/g, '');

      // Replace tmp symbol with standard decimal symbol of '.'
      value = value.replace(tmpSymbol, '.');
    }
    return super.fromUIValue(value);
  }

  getUIValue() {
    let value = super.getUIValue();
    const decimalSymbol = this.get('decimalSymbol');
    if (decimalSymbol && decimalSymbol !== '.' && !this.isBlank()) {
      // As per JS conventions, our values are always stored with a decimal symbol of '.'.
      // Therefore, we replace the '.' with the decimalSymbol so that we can support alternative
      // decimal symbols like Germany's ','.
      return value.replace('.', decimalSymbol);
    } else {
      return value;
    }
  }
}
